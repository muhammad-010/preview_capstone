<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { DetectedBarcode } from 'nuxt-qrcode'
import { FetchError } from 'ofetch'

const { $api } = useNuxtApp()
const route = useRoute()
const id = Number(route.params.event_id)
const { tenantId } = useUserState()
const toast = useToast()
const isClient = import.meta.client

const checkInMethods = {
    [CHECK_IN_METHOD_QR]: 'Scan QR',
    [CHECK_IN_METHOD_MANUAL]: 'Input Phone Number',
}
const checkInMethodDialog = ref(true)
const activeCheckInMethod = ref<typeof CHECK_IN_METHOD_QR | typeof CHECK_IN_METHOD_MANUAL | null>(null)
const inverseCheckInMethodLabel = computed(() => {
    switch (activeCheckInMethod.value) {
        case CHECK_IN_METHOD_QR:
            return `Switch to ${checkInMethods[CHECK_IN_METHOD_MANUAL]}`
        case CHECK_IN_METHOD_MANUAL:
            return `Switch to ${checkInMethods[CHECK_IN_METHOD_QR]}`
        default:
            return 'No check-in method selected'
    }
})
function checkInQr() {
    activeCheckInMethod.value = CHECK_IN_METHOD_QR
    checkInMethodDialog.value = false
}
function checkInManual() {
    activeCheckInMethod.value = CHECK_IN_METHOD_MANUAL
    checkInMethodDialog.value = false
}
function switchCheckInMethod() {
    switch (activeCheckInMethod.value) {
        case CHECK_IN_METHOD_QR:
            activeCheckInMethod.value = CHECK_IN_METHOD_MANUAL
            break
        case CHECK_IN_METHOD_MANUAL:
            activeCheckInMethod.value = CHECK_IN_METHOD_QR
            break
        default:
            break
    }
}

const checkInSuccessDialog = ref(false)
const checkInFailedDialog = ref(false)
const confirmAttendanceDialog = ref(false)
const errorMessage = ref<string>('')
function openCheckInSuccess() {
    confirmAttendanceDialog.value = false
    checkInSuccessDialog.value = true
    playSuccessSound()
    setTimeout(() => {
        checkInSuccessDialog.value = false
    }, 5000)
}
function openCheckInFailed(msg: string) {
    errorMessage.value = msg
    checkInFailedDialog.value = true
    playErrorSound()
    setTimeout(() => {
        checkInFailedDialog.value = false
    }, 5000)
}

const participantId = ref(0)
const participantQr = ref('')
const participant = ref({
    name: '',
    maxAttendance: 0,
})

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
function openConfirmAttendanceDialog() {
    confirmAttendanceDialog.value = true
    playCheckinSound()
}
function resetRef() {
    confirmAttendanceDialog.value = false
    checkInSuccessDialog.value = false
    checkInFailedDialog.value = false
    setTimeout(() => {
        participantId.value = 0
        participantQr.value = ''
        errorMessage.value = ''
    }, 500)
}

watch(checkInSuccessDialog, (value, oldValue) => {
    if (!value && value !== oldValue) {
        resetRef()
    }
})

watch(checkInFailedDialog, (value, oldValue) => {
    if (!value && value !== oldValue) {
        resetRef()
    }
})

async function useDetail(tId: number, id: number) {
    const { data } = await useApi(`/api/tenant/${tId}/event/${id}/detail`, {
        transform: res => ({
            ...res.data,
        }),
    })
    const event = computed<TenantEvent>(() => data.value ?? {} as TenantEvent)

    return {
        event,
    }
}

async function useScanQr(tId: number, id: number) {
    const pauseQr = ref(false)

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
        participantQr.value = qrCode.rawValue

        try {
            const { data } = await $api(`/api/tenant/${tId}/event/${id}/participant/check-in`, {
                method: 'POST',
                body: {
                    token: participantQr.value,
                },
            })
            participant.value = {
                name: data.participant.name || '',
                maxAttendance: data.participant.max_attendance || 0,
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
                openCheckInFailed(error.response._data.data.message)
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
        finally {
            setTimeout(() => {
                pauseQr.value = false
            }, 500)
        }
    }

    return {
        pauseQr,
        qrDetected,
    }
}

async function useManual(tId: number, id: number) {
    async function selectParticipant(selectedParticipant: Participant | undefined) {
        if (!selectedParticipant) return

        participantId.value = selectedParticipant.participant_id || 0
        participant.value = {
            name: selectedParticipant.name,
            maxAttendance: 0,
        }
        await manualCheckIn()
    }

    async function manualCheckIn() {
        if (!participantId.value) return

        try {
            const { data } = await $api(`/api/tenant/${tId}/event/${id}/participant/check-in/manual`, {
                method: 'POST',
                body: {
                    participant_id: participantId.value,
                },
            })
            participant.value.maxAttendance = data.participant.max_attendance
            if (data.confirmation_attendance) {
                openConfirmAttendanceDialog()
            }
            else {
                openCheckInSuccess()
            }
        }
        catch (error) {
            if (error instanceof FetchError && error.response) {
                openCheckInFailed(error.response._data.data.message)
            }
            else {
                toast.add({
                    title: 'Error',
                    description: 'Failed to manually check in participant',
                    color: 'error',
                })
                console.error('Manual check in participant error', error)
            }
        }
    }

    return {
        selectParticipant,
        manualCheckIn,
    }
}

async function useConfirmAttendance(tId: number, id: number) {
    const state = reactive({ count: 0 })
    type Schema = typeof state

    function validateConfirmAttendance(state: Partial<Schema>): FormError[] {
        const errors = []
        if (!state.count) errors.push({ name: 'count', message: 'Guest count is required, minimum is 1' })
        else if (state.count > participant.value.maxAttendance) errors.push({ name: 'count', message: `Can not more than ${participant.value.maxAttendance}` })
        return errors
    }

    async function confirmAttendanceQr(event: FormSubmitEvent<Schema>) {
        try {
            await $api(`/api/tenant/${tId}/event/${id}/participant/check-in/confirm`, {
                method: 'POST',
                body: {
                    token: participantQr.value,
                    count_attendance: Number(event.data.count),
                },
            })
            openCheckInSuccess()
        }
        catch (error) {
            if (error instanceof FetchError && error.response) {
                openCheckInFailed(error.response._data.data.message)
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

    async function confirmAttendanceManual(event: FormSubmitEvent<Schema>) {
        try {
            await $api(`/api/tenant/${tId}/event/${id}/participant/check-in/confirm/manual`, {
                method: 'POST',
                body: {
                    participant_id: participantId.value,
                    count_attendance: Number(event.data.count),
                },
            })
            openCheckInSuccess()
        }
        catch (error) {
            if (error instanceof FetchError && error.response) {
                openCheckInFailed(error.response._data.data.message)
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

    async function confirmAttendance(event: FormSubmitEvent<Schema>) {
        switch (activeCheckInMethod.value) {
            case CHECK_IN_METHOD_QR:
                confirmAttendanceQr(event)
                break
            case CHECK_IN_METHOD_MANUAL:
                confirmAttendanceManual(event)
                break
            default:
                break
        }
    }

    return {
        state,
        validateConfirmAttendance,
        confirmAttendance,
    }
}

const [
    {
        event,
    },

    {
        pauseQr,
        qrDetected,
    },

    {
        selectParticipant,
    },
] = await Promise.all([
    useDetail(tenantId.value, id),
    useScanQr(tenantId.value, id),
    useManual(tenantId.value, id),
])

const {
    state,
    validateConfirmAttendance,
    confirmAttendance,
} = await useConfirmAttendance(tenantId.value, id)

useHead({
    title: computed(() => `Check In - ${event.value ? event.value.name : 'Event'}`),
})
definePageMeta({
    layout: 'check-in',
    middleware: ['check-in'],
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
        <div class="flex justify-center mb-6">
            <UButton
                color="neutral"
                :label="inverseCheckInMethodLabel"
                @click="switchCheckInMethod"
            />
        </div>

        <CheckInScan
            v-if="activeCheckInMethod === CHECK_IN_METHOD_QR"
            v-model:pause-qr="pauseQr"
            @qr-detect="qrDetected"
        />

        <CheckInManual
            v-else-if="activeCheckInMethod === CHECK_IN_METHOD_MANUAL"
            :event-id="id"
            title="Manual Check In"
            button-label="Check In"
            @select="selectParticipant"
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
                        class="flex flex-col items-center"
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

        <UModal
            v-model:open="checkInMethodDialog"
            :dismissible="false"
        >
            <template #content>
                <div class="flex flex-col gap-6 p-6">
                    <div>
                        <h2>Please select check-in method</h2>
                    </div>

                    <button
                        class="cursor-pointer bg-success text-white text-2xl font-semibold py-4 px-6 rounded-xl"
                        @click="checkInQr"
                    >
                        Scan QR
                    </button>

                    <button
                        class="cursor-pointer bg-primary text-white text-2xl font-semibold py-4 px-6 rounded-xl"
                        @click="checkInManual"
                    >
                        Input Phone Number
                    </button>
                </div>
            </template>
        </UModal>

        <ModalCheckInSuccess
            v-model:open="checkInSuccessDialog"
            :event="event.name"
            :participant="participant.name"
        />

        <ModalCheckInFailed
            v-model:open="checkInFailedDialog"
            :message="errorMessage"
        />
    </div>
</template>
