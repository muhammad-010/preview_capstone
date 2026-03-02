<script setup lang="ts">
import type { DetectedBarcode } from 'nuxt-qrcode'

const route = useRoute()
const id = Number(route.params.event_id)
const { tenantId } = useUserState()

async function useDetail(tId: number, id: number) {
    const qrValue = ref('')
    const participantName = ref('')
    const attendanceCount = ref(0)
    const confirmationAttendanceDialog = ref(false)
    const checkInSuccessDialog = ref(false)
    const toast = useToast()
    const { data } = await useFetch(`/api/tenant/${tId}/event/${id}/detail`, {
        transform: res => ({
            ...res.data,
        }),
    })
    const event = computed<TenantEvent>(() => data.value ?? {} as TenantEvent)
    const startDate = computed(() => formatShortDate(event.value.start_time))
    const startHour = computed(() => formatHour(event.value.start_time))

    function resetRef() {
        qrValue.value = ''
        attendanceCount.value = 0
        confirmationAttendanceDialog.value = false
        checkInSuccessDialog.value = false
    }

    function openCheckInSuccess() {
        resetRef()
        checkInSuccessDialog.value = true
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
            const { data } = await useFetch(`/api/tenant/${tId}/event/${id}/participant/check-in`, {
                method: 'POST',
                transform: res => res.data,
                body: {
                    token: qrValue.value,
                },
            })
            const needConfirm = !!data.value?.confirmation_attendance
            if (needConfirm) {
                confirmationAttendanceDialog.value = true
            }
            else {
                openCheckInSuccess()
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed submitting QR',
                color: 'error',
            })
            console.error('Failed submitting QR', error)
        }
    }

    async function confirmAttendance() {
        try {
            await useFetch(`/api/tenant/${tId}/event/${id}/participant/check-in/confirm`, {
                method: 'POST',
                body: {
                    token: qrValue.value,
                    count_attendance: attendanceCount.value,
                },
            })
            openCheckInSuccess()
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed confirming check-in',
                color: 'error',
            })
            console.error('Failed confirming check-in', error)
        }
    }

    return {
        qrValue,
        participantName,
        confirmationAttendanceDialog,
        attendanceCount,
        checkInSuccessDialog,
        event,
        startDate,
        startHour,
        qrDetected,
        confirmAttendance,
    }
}

const {
    // participantName,
    confirmationAttendanceDialog,
    attendanceCount,
    checkInSuccessDialog,
    event,
    startDate,
    startHour,
    qrDetected,
    confirmAttendance,
} = await useDetail(tenantId.value, id)

useHead({
    title: `Event - ${event.value.name}`,
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
            :event-name="event.name"
            :tenant="'tenant'"
            :start-date="startDate"
            :start-hour="startHour"
            :location="event.location"
            @qr-detect="qrDetected"
        />

        <UModal v-model:open="checkInSuccessDialog">
            <template #content>
                <div class="flex flex-col justify-center items-center p-12">
                    <UIcon
                        name="lucide:circle-check"
                        class="text-success size-32 mb-8"
                    />
                    <h2 class="mb-8">
                        Check-In Success
                    </h2>
                    <small>Click anywhere to close modal</small>
                </div>
            </template>
        </UModal>

        <UModal
            v-model:open="confirmationAttendanceDialog"
            title="Confirm Your Attendance"
        >
            <template #body>
                <div class="flex flex-col justify-center items-center">
                    <UFormField
                        label="Number of guests"
                        size="xl"
                    >
                        <UInput
                            v-model="attendanceCount"
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
