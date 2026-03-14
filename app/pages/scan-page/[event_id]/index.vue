<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { DetectedBarcode } from 'nuxt-qrcode'
import { FetchError } from 'ofetch'

const { $api } = useNuxtApp()
const route = useRoute()
const id = Number(route.params.event_id)
const { tenantId, tenantName } = useUserState()
const toast = useToast()

const isClient = import.meta.client
let checkinAudio: HTMLAudioElement
let successAudio: HTMLAudioElement
let errorAudio: HTMLAudioElement
onMounted(() => {
    window.addEventListener('pointerdown', () => {
        checkinAudio = new Audio('/checkin-sound.mp3')
        successAudio = new Audio('/success-sound.mp3')
        errorAudio = new Audio('/error-sound.mp3')
        Promise.all([
            checkinAudio.play().then(() => {
                checkinAudio.pause()
                checkinAudio.currentTime = 0
            }),
            successAudio.play().then(() => {
                successAudio.pause()
                successAudio.currentTime = 0
            }),
            errorAudio.play().then(() => {
                errorAudio.pause()
                errorAudio.currentTime = 0
            }),
        ])
    }, { once: true })
})
function playCheckinSound() {
    if (isClient && checkinAudio) checkinAudio.play()
}
function playSuccessSound() {
    if (isClient && successAudio) successAudio.play()
}
function playErrorSound() {
    if (isClient && errorAudio) errorAudio.play()
}

async function useDetail(tId: number, id: number) {
    const { data } = await useApi(`/api/tenant/${tId}/event/${id}/detail`, {
        transform: res => ({
            ...res.data,
        }),
    })
    const event = computed<TenantEvent>(() => data.value ?? {} as TenantEvent)
    const startDate = computed(() => formatShortDate(event.value.start_time))
    const startHour = computed(() => formatHour(event.value.start_time))

    return {
        event,
        startDate,
        startHour,
    }
}

async function useScanQr(tId: number, id: number) {
    const qrValue = ref('')
    const pauseQr = ref(true)
    const participant = ref({
        name: '',
        maxAttendance: 0,
        confirmAttendance: false,
    })
    const errorMessage = ref<string>(ERROR_SCAN_QR_MESSAGE)
    const state = reactive({ count: 0 })
    const confirmAttendanceDialog = ref(false)
    const checkInSuccessDialog = ref(false)
    const scanFailedDialog = ref(false)
    const scanReminderDialog = ref(true)

    type Schema = typeof state

    watch(scanReminderDialog, (value) => {
        if (!value) {
            pauseQr.value = false
        }
    })

    function resetRef() {
        qrValue.value = ''
        errorMessage.value = ERROR_SCAN_QR_MESSAGE
        pauseQr.value = false
        state.count = 0
        confirmAttendanceDialog.value = false
        checkInSuccessDialog.value = false
        scanFailedDialog.value = false
    }

    watch(checkInSuccessDialog, (value, oldValue) => {
        if (!value && value !== oldValue) {
            resetRef()
        }
    })

    function openConfirmAttendanceDialog() {
        confirmAttendanceDialog.value = true
        playCheckinSound()
    }

    function openCheckInSuccess() {
        confirmAttendanceDialog.value = false
        checkInSuccessDialog.value = true
        playSuccessSound()
        setTimeout(() => {
            checkInSuccessDialog.value = false
        }, 5000)
    }

    function openScanFailed(msg: string) {
        errorMessage.value = msg
        scanFailedDialog.value = true
        playErrorSound()
        setTimeout(() => {
            scanFailedDialog.value = false
            resetRef()
        }, 5000)
    }

    async function qrDetected(qrCodes: DetectedBarcode[]) {
        if (qrCodes.length <= 0) {
            toast.add({
                title: 'Error',
                description: 'No QR read',
                color: 'error',
            })
            return
        }
        const qrCode = qrCodes[0]
        if (!qrCode || !qrCode.rawValue) {
            toast.add({
                title: 'Error',
                description: 'Invalid QR code',
                color: 'error',
            })
            return
        }
        qrValue.value = qrCode.rawValue
        try {
            const { data } = await $api(`/api/tenant/${tId}/event/${id}/participant/check-in`, {
                method: 'POST',
                body: {
                    token: qrValue.value,
                },
            })
            participant.value = {
                name: data.participant.name || '',
                maxAttendance: data.participant.max_attendance || 0,
                confirmAttendance: data.confirmation_attendance,
            }
            if (data.confirmation_attendance) {
                openConfirmAttendanceDialog()
            }
            else {
                openCheckInSuccess()
            }
        }
        catch (error) {
            if (error instanceof FetchError && error.response) {
                openScanFailed(error.response._data.data.message)
            }
            else {
                toast.add({
                    title: 'Error',
                    description: 'Failed submitting QR',
                    color: 'error',
                })
                console.error('Failed submitting QR', error)
                playErrorSound()
                resetRef()
            }
        }
    }

    function closeConfirmAttendance(close: () => void) {
        close()
        resetRef()
    }

    function validateConfirmAttendance(state: Partial<Schema>): FormError[] {
        const errors = []
        if (!state.count) errors.push({ name: 'count', message: 'Guest count is required, minimum is 1' })
        else if (state.count > participant.value.maxAttendance) errors.push({ name: 'count', message: `Can not more than ${participant.value.maxAttendance}` })
        return errors
    }

    async function confirmAttendance(event: FormSubmitEvent<Schema>) {
        try {
            await $api(`/api/tenant/${tId}/event/${id}/participant/check-in/confirm`, {
                method: 'POST',
                body: {
                    token: qrValue.value,
                    count_attendance: Number(event.data.count),
                },
            })
            openCheckInSuccess()
        }
        catch (error) {
            if (error instanceof FetchError && error.response) {
                openScanFailed(error.response._data.data.message)
            }
            else {
                toast.add({
                    title: 'Error',
                    description: 'Failed confirming check-in',
                    color: 'error',
                })
                console.error('Failed confirming check-in', error)
            }
        }
    }

    return {
        qrValue,
        pauseQr,
        participant,
        errorMessage,
        confirmAttendanceDialog,
        state,
        checkInSuccessDialog,
        scanFailedDialog,
        scanReminderDialog,
        qrDetected,
        closeConfirmAttendance,
        validateConfirmAttendance,
        confirmAttendance,
    }
}

const [
    {
        event,
        startDate,
        startHour,
    },

    {
        pauseQr,
        participant,
        errorMessage,
        confirmAttendanceDialog,
        state,
        checkInSuccessDialog,
        scanFailedDialog,
        scanReminderDialog,
        qrDetected,
        confirmAttendance,
        validateConfirmAttendance,
    },
] = await Promise.all([
    useDetail(tenantId.value, id),
    useScanQr(tenantId.value, id),
])

useHead({
    title: computed(() => `Check In - ${event.value ? event.value.name : 'Event'}`),
})
definePageMeta({
    layout: 'scan',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {
    [':event_id']: {
        param: route.params.event_id as string,
        label: event.value.name,
    },
}))
</script>

<template>
    <div class="max-w-[60vw]">
        <CardScan
            v-model:pause-qr="pauseQr"
            :event-name="event.name"
            :tenant="tenantName"
            :start-date="startDate"
            :start-hour="startHour"
            :location="event.location"
            @qr-detect="qrDetected"
        />

        <UModal
            v-model:open="confirmAttendanceDialog"
            :dismissible="false"
        >
            <template #header>
                <div>
                    <h2 class="text-highlighted font-semibold">
                        Confirm Attendance
                    </h2>
                </div>
            </template>
            <template #body>
                <div class="flex flex-col p-4">
                    <div class="text-center mb-8">
                        <div class="text-2xl">
                            Please confirm guests attendance for {{ participant.name }}
                        </div>
                        <div class="text-xl">
                            (Max {{ participant.maxAttendance }})
                        </div>
                    </div>

                    <UForm
                        :validate="validateConfirmAttendance"
                        :state="state"
                        class="flex flex-col justify-center"
                        @submit="confirmAttendance"
                    >
                        <UFormField
                            label="Number of guests"
                            name="count"
                            required
                            class="text-lg mb-8"
                        >
                            <UInput
                                v-model="state.count"
                                :ui="{
                                    base: 'px-4 py-4 text-5xl text-center gap-2',
                                    leading: 'ps-4',
                                    trailing: 'pe-4',
                                }"
                            >
                                <template #leading>
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        icon="lucide:minus"
                                        size="xl"
                                        :disabled="state.count === 0"
                                        @click="state.count--"
                                    />
                                </template>
                                <template #trailing>
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        icon="lucide:plus"
                                        size="xl"
                                        :disabled="state.count === participant.maxAttendance"
                                        @click="state.count++"
                                    />
                                </template>
                            </UInput>
                        </UFormField>
                        <button
                            type="submit"
                            class="cursor-pointer bg-primary text-white text-2xl font-semibold py-4 px-6 rounded-xl"
                        >
                            Check In
                        </button>
                    </UForm>
                </div>
            </template>
        </UModal>

        <UModal v-model:open="scanReminderDialog">
            <template #content>
                <div class="flex flex-col justify-center items-center text-center p-12">
                    <UIcon
                        name="lucide:circle-alert"
                        class="text-warning size-32 mb-8 rotate-180"
                    />
                    <div class="mb-6">
                        <h2>
                            You’re about to start the QR scanner.
                        </h2>
                    </div>
                    <div class="mb-4">
                        <h5>Ask participants to show their QR Code for scanning.</h5>
                        <h5>Don't forget to double check participant name and their invitation ticket</h5>
                    </div>
                    <small>Click anywhere to close this dialog</small>
                </div>
            </template>
        </UModal>

        <UModal v-model:open="checkInSuccessDialog">
            <template #content>
                <div class="flex flex-col justify-center items-center text-center p-12">
                    <UIcon
                        name="lucide:circle-check"
                        class="text-success size-32 mb-8"
                    />
                    <div class="mb-6">
                        <h2>
                            Welcome to {{ event.name }}, {{ participant.name }}!
                        </h2>
                    </div>
                    <h5>We’re excited to have you join us.</h5>
                    <h5>Enjoy the event, and don’t forget to connect with new friends!</h5>
                </div>
            </template>
        </UModal>

        <UModal v-model:open="scanFailedDialog">
            <template #content>
                <div class="flex flex-col justify-center items-center text-center p-12">
                    <UIcon
                        name="lucide:circle-x"
                        class="text-error size-32 mb-8"
                    />
                    <div class="mb-6">
                        <h2>
                            {{ errorMessage }}
                        </h2>
                    </div>
                    <h5>Please check your QR Code and try again.</h5>
                </div>
            </template>
        </UModal>
    </div>
</template>
