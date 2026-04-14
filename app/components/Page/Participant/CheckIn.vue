<script setup lang="ts">
import type { FormSubmitEvent, FormError } from '@nuxt/ui'

const props = defineProps<{
    tenantId: number
    eventId: number
}>()
const manualCheckInTarget = defineModel<ParticipantCheckInTarget>('target', { default: () => ({
    id: 0,
    name: '',
    maxAttendance: 0,
}) })
const manualCheckInConfirmation = defineModel<boolean>('open', { default: false })
const emit = defineEmits([EMIT_TABLE_REFRESH])

const { $api } = useNuxtApp()
const toast = useToast()
const manualCheckInGuestConfirmation = ref(false)
const manualCheckInGuest = reactive({ count: 0 })

type CheckInGuestSchema = typeof manualCheckInGuest

function resetManualCheckInTarget() {
    manualCheckInTarget.value = {
        id: 0,
        name: '',
        maxAttendance: 0,
    }
}

function closeConfirmManualCheckIn(reset: boolean) {
    manualCheckInConfirmation.value = false
    if (reset) resetManualCheckInTarget()
}

function closeConfirmManualCheckInGuest() {
    manualCheckInGuestConfirmation.value = false
    resetManualCheckInTarget()
}

async function manualCheckIn() {
    try {
        const { data } = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/participant/check-in/manual`, {
            method: 'POST',
            body: {
                participant_id: manualCheckInTarget.value.id,
            },
        })
        manualCheckInTarget.value.maxAttendance = data.participant.max_attendance
        if (data.confirmation_attendance) {
            manualCheckInGuestConfirmation.value = true
        }
        else {
            toast.add({
                title: 'Success',
                description: 'Manual check in success',
                color: 'success',
            })
        }
        closeConfirmManualCheckIn(!data.confirmation_attendance)
        emit(EMIT_TABLE_REFRESH)
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to manually check in participant',
            color: 'error',
        })
        console.error('Manual check in participant error', error)
    }
}

function validateManualCheckInGuest(state: Partial<CheckInGuestSchema>): FormError[] {
    const errors = []
    if (!state.count) errors.push({ name: 'count', message: 'Guest count is required, minimum is 1' })
    else if (state.count > manualCheckInTarget.value.maxAttendance) errors.push({ name: 'count', message: `Can not more than ${manualCheckInTarget.value.maxAttendance}` })
    return errors
}

async function manualCheckInGuestSubmit(event: FormSubmitEvent<CheckInGuestSchema>) {
    try {
        await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/participant/check-in/confirm/manual`, {
            method: 'POST',
            body: {
                participant_id: manualCheckInTarget.value.id,
                count_attendance: Number(event.data.count),
            },
        })
        toast.add({
            title: 'Success',
            description: 'Manual submit participant guest success',
            color: 'success',
        })
        closeConfirmManualCheckInGuest()
        emit(EMIT_TABLE_REFRESH)
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to manually submit participant guest',
            color: 'error',
        })
        console.error('Manual submit participant guest error', error)
    }
}
</script>

<template>
    <div>
        <ModalConfirmPositiveAction
            v-model:open="manualCheckInConfirmation"
            title="Manual Check-In Confirmation"
            :body="`Are you sure you want to check-in ${manualCheckInTarget.name}?`"
            @confirm="manualCheckIn()"
        />

        <UModal
            v-model:open="manualCheckInGuestConfirmation"
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
                <div class="flex flex-col">
                    <div class="text-center mb-4">
                        <h3>
                            Please confirm guests attendance for {{ manualCheckInTarget.name }}
                        </h3>
                        <h4>
                            (Max {{ manualCheckInTarget.maxAttendance }})
                        </h4>
                    </div>

                    <UForm
                        :validate="validateManualCheckInGuest"
                        :state="manualCheckInGuest"
                        class="flex flex-col items-center"
                        @submit="manualCheckInGuestSubmit"
                    >
                        <UFormField
                            label="Number of guests"
                            name="count"
                            required
                            class="mb-4"
                        >
                            <UInput
                                v-model="manualCheckInGuest.count"
                                class="text-center"
                                :ui="{
                                    base: 'text-center',
                                }"
                            >
                                <template #leading>
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        icon="lucide:minus"
                                        size="xl"
                                        :disabled="manualCheckInGuest.count === 0"
                                        @click="manualCheckInGuest.count--"
                                    />
                                </template>
                                <template #trailing>
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        icon="lucide:plus"
                                        size="xl"
                                        :disabled="manualCheckInGuest.count === manualCheckInTarget.maxAttendance"
                                        @click="manualCheckInGuest.count++"
                                    />
                                </template>
                            </UInput>
                        </UFormField>
                        <UButton
                            type="submit"
                            label="Check In"
                            class="cursor-pointer"
                        />
                    </UForm>
                </div>
            </template>
        </UModal>
    </div>
</template>
