<script setup lang="ts">
import type { FormSubmitEvent, FormError } from '@nuxt/ui'

const props = defineProps<{
    tenantId: number
    eventId: number
    scan?: boolean
}>()
const target = defineModel<ParticipantCheckInTarget>('target', { default: () => ({
    id: 0,
    sessionId: 0,
    name: '',
    maxAttendance: 0,
}) })
const sessionDialog = defineModel<boolean>('open', { default: false })
const emit = defineEmits([EMIT_TABLE_REFRESH])

const { $api } = useNuxtApp()
const toast = useToast()
const checkInDialog = ref(false)
const guestConfirmationDialog = ref(false)
const guestConfirmation = reactive({ count: 0 })
const sessions = ref<TenantEventSession[]>([])
const sessionLoading = ref(false)
watch([target, sessionDialog], async ([newTarget, newSessionDialog]) => {
    if (newSessionDialog && newTarget.id) {
        sessionLoading.value = true
        sessions.value = await useRawFindParticipantSession(props.tenantId, props.eventId, newTarget.id)
        sessionLoading.value = false
    }
})

type GuestConfirmationSchema = typeof guestConfirmation

function resetTarget() {
    target.value = {
        id: 0,
        sessionId: 0,
        sessionName: '',
        name: '',
        maxAttendance: 0,
    }
}

function openCheckInDialog(sId: number, sName: string) {
    target.value.sessionId = sId
    target.value.sessionName = sName
    sessionDialog.value = false
    checkInDialog.value = true
}

function closeCheckInDialog(reset: boolean) {
    checkInDialog.value = false
    if (reset) resetTarget()
}

function closeGuestConfirmationDialog() {
    guestConfirmationDialog.value = false
    guestConfirmation.count = 0
    resetTarget()
}

async function checkIn() {
    try {
        const { data } = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/session/${target.value.sessionId}/check-in/manual`, {
            method: 'POST',
            body: {
                participant_id: target.value.id,
            },
        })
        target.value.maxAttendance = data.participant.max_attendance
        if (data.confirmation_attendance) {
            guestConfirmationDialog.value = true
        }
        else {
            toast.add({
                title: 'Success',
                description: 'Manual check in success',
                color: 'success',
            })
            emit(EMIT_TABLE_REFRESH)
        }
        closeCheckInDialog(!data.confirmation_attendance)
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

function validateGuestConfirmation(state: Partial<GuestConfirmationSchema>): FormError[] {
    const errors = []
    if (!state.count) errors.push({ name: 'count', message: 'Guest count is required, minimum is 1' })
    else if (state.count > target.value.maxAttendance) errors.push({ name: 'count', message: `Can not more than ${target.value.maxAttendance}` })
    return errors
}

async function submitGuestConfirmation(event: FormSubmitEvent<GuestConfirmationSchema>) {
    try {
        await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/session/${target.value.sessionId}/check-in/confirm/manual`, {
            method: 'POST',
            body: {
                participant_id: target.value.id,
                count_attendance: Number(event.data.count),
            },
        })
        toast.add({
            title: 'Success',
            description: 'Manual submit participant guest success',
            color: 'success',
        })
        closeGuestConfirmationDialog()
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
        <UModal
            v-model:open="sessionDialog"
            :ui="{ body: 'p-0 sm:p-0' }"
        >
            <template #header>
                <div>
                    <h2 class="text-highlighted font-semibold">
                        Select Session
                    </h2>
                </div>
            </template>
            <template #body>
                <MiscLoadingOverlay :loading="sessionLoading">
                    <div class="flex flex-col gap-4 p-4 sm:p-6">
                        <UCard
                            v-for="ps in sessions"
                            :key="ps.event_session_id"
                            :class="`relative overflow-hidden ring-2 ${ps.checked_in_at ? '' : 'cursor-pointer ring-primary group transition'}`"
                            @click="() => ps.checked_in_at ? void 0 : openCheckInDialog(ps.event_session_id, ps.name)"
                        >
                            <div class="pointer-events-none absolute inset-0 bg-primary/0 group-hover:bg-primary/10 group-hover:dark:bg-primary/20 transition" />

                            <div class="relative z-10">
                                <div class="flex justify-between items-center gap-2">
                                    <h3 class="text-highlighted font-semibold">
                                        {{ ps.name }}
                                    </h3>

                                    <UBadge
                                        v-if="ps.checked_in_at"
                                        icon="lucide:check-circle"
                                        color="success"
                                        :label="`${formatHour(ps.checked_in_at)}`"
                                        size="lg"
                                        variant="subtle"
                                    />
                                </div>

                                <div class="flex flex-col">
                                    <DetailSectionData
                                        icon="lucide:clock"
                                        :subtitle="`${formatLongDate(ps.start_time)} - ${formatLongDate(ps.end_time)}`"
                                    />

                                    <DetailSectionData
                                        icon="lucide:map-pin"
                                        :subtitle="ps.location"
                                    />
                                </div>
                            </div>
                        </UCard>
                    </div>
                </MiscLoadingOverlay>
            </template>
        </UModal>

        <ModalConfirmPositiveAction
            v-model:open="checkInDialog"
            title="Manual Check-In Confirmation"
            :body="`Are you sure you want to check-in ${target.name} on session ${target.sessionName}?`"
            @confirm="checkIn()"
        />

        <UModal
            v-model:open="guestConfirmationDialog"
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
                            Please confirm guests attendance for {{ target.name }}
                        </h3>
                        <h4>
                            (Max {{ target.maxAttendance }})
                        </h4>
                    </div>

                    <UForm
                        :validate="validateGuestConfirmation"
                        :state="guestConfirmation"
                        class="flex flex-col items-center"
                        @submit="submitGuestConfirmation"
                    >
                        <UFormField
                            label="Number of guests"
                            name="count"
                            required
                            class="mb-4"
                        >
                            <UInput
                                v-model="guestConfirmation.count"
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
                                        :disabled="guestConfirmation.count === 0"
                                        @click="guestConfirmation.count--"
                                    />
                                </template>
                                <template #trailing>
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        icon="lucide:plus"
                                        size="xl"
                                        :disabled="guestConfirmation.count === target.maxAttendance"
                                        @click="guestConfirmation.count++"
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
