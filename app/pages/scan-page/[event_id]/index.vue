<script setup lang="ts">
import type { DetectedBarcode } from 'nuxt-qrcode'
import { FetchError } from 'ofetch'

const { $api } = useNuxtApp()
const route = useRoute()
const id = Number(route.params.event_id)
const { tenantId, tenantName } = useUserState()
const toast = useToast()

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
    const pauseQr = ref(false)
    const participantName = ref('')
    const errorMessage = ref<string>(ERROR_SCAN_QR_MESSAGE)
    const countAttendance = ref(0)
    const confirmAttendanceDialog = ref(false)
    const checkInSuccessDialog = ref(false)
    const scanFailedDialog = ref(false)

    function resetRef() {
        qrValue.value = ''
        errorMessage.value = ERROR_SCAN_QR_MESSAGE
        pauseQr.value = false
        countAttendance.value = 0
        confirmAttendanceDialog.value = false
        checkInSuccessDialog.value = false
        scanFailedDialog.value = false
    }

    watch(checkInSuccessDialog, (value, oldValue) => {
        if (!value && value !== oldValue) {
            resetRef()
        }
    })

    function openCheckInSuccess() {
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
            participantName.value = data.participant.name || ''
            if (data.confirmation_attendance) {
                confirmAttendanceDialog.value = true
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

    async function confirmAttendance() {
        try {
            await $api(`/api/tenant/${tId}/event/${id}/participant/check-in/confirm`, {
                method: 'POST',
                body: {
                    token: qrValue.value,
                    count_attendance: countAttendance.value,
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
                playErrorSound()
                resetRef()
            }
        }
    }

    return {
        qrValue,
        pauseQr,
        participantName,
        errorMessage,
        confirmAttendanceDialog,
        countAttendance,
        checkInSuccessDialog,
        scanFailedDialog,
        qrDetected,
        closeConfirmAttendance,
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
        participantName,
        errorMessage,
        confirmAttendanceDialog,
        countAttendance,
        checkInSuccessDialog,
        scanFailedDialog,
        qrDetected,
        closeConfirmAttendance,
        confirmAttendance,
    },
] = await Promise.all([
    useDetail(tenantId.value, id),
    useScanQr(tenantId.value, id),
])

useHead({
    title: computed(() => `Event - ${event.value ? event.value.name : 'Detail'}`),
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

        <UModal v-model:open="checkInSuccessDialog">
            <template #content>
                <div class="flex flex-col justify-center items-center text-center p-12">
                    <UIcon
                        name="lucide:circle-check"
                        class="text-success size-32 mb-8"
                    />
                    <div class="mb-6">
                        <h2>
                            Welcome to {{ event.name }}, {{ participantName }}!
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

        <UModal v-model:open="confirmAttendanceDialog">
            <template #header="{ close }">
                <div>
                    <h2 class="text-highlighted font-semibold">
                        Confirm Your Attendance
                    </h2>
                </div>
                <UButton
                    icon="lucide:x"
                    color="neutral"
                    variant="ghost"
                    class="rounded-md ml-auto"
                    @click="() => closeConfirmAttendance(close)"
                />
            </template>
            <template #body>
                <div class="flex flex-col justify-center items-center">
                    <UFormField
                        label="Number of guests"
                        size="xl"
                    >
                        <UInput
                            v-model="countAttendance"
                            size="xl"
                            type="number"
                            class="mb-8"
                        />
                    </UFormField>
                    <UButton
                        label="Check In"
                        size="xl"
                        @click="confirmAttendance"
                    />
                </div>
            </template>
        </UModal>
    </div>
</template>
