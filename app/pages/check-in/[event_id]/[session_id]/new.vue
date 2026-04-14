<script setup lang="ts">
const route = useRoute()
const eventId = Number(route.params.event_id)
const sessionId = Number(route.params.session_id)
const { tenantId } = useUserState()

const checkInSuccessDialog = ref(false)
const checkInFailedDialog = ref(false)
const targetParticipant = ref<ParticipantCheckInTarget>({
    id: 0,
    sessionId: 0,
    sessionName: '',
    name: '',
    maxAttendance: 0,
})
const errorMessage = ref<string>('')

const { data } = await useApi(`/api/tenant/${tenantId.value}/event/${eventId}/detail`, {
    transform: res => ({
        ...res.data,
    }),
})
const event = computed<TenantEvent>(() => data.value ?? {} as TenantEvent)

useHead({
    title: computed(() => `Check In - ${event.value ? event.value.name : 'Event'}`),
})
definePageMeta({
    layout: 'check-in',
    middleware: ['check-in'],
})
</script>

<template>
    <div>
        <PageCheckInMain
            v-model:open-success="checkInSuccessDialog"
            v-model:open-failed="checkInFailedDialog"
            v-model:participant="targetParticipant"
            v-model:error-message="errorMessage"
            :tenant-id="tenantId"
            :event-id="eventId"
            :session-id="sessionId"
        />

        <ModalCheckInSuccess
            v-model:open="checkInSuccessDialog"
            :event="event.name"
            :participant="targetParticipant.name"
        >
            <template #title>
                <h3>Check In Success!</h3>
            </template>
            <template #subtitle>
                <h2>Name: {{ targetParticipant.name }}</h2>
                <h2>Max Pax: {{ targetParticipant.maxAttendance }}</h2>
            </template>
        </ModalCheckInSuccess>

        <ModalCheckInFailed
            v-model:open="checkInFailedDialog"
            :message="errorMessage"
        />
    </div>
</template>
