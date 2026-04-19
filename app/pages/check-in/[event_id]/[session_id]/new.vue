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
    customAttributes: [],
})
const errorMessage = ref<string>('')

const { data } = useApi(`/api/tenant/${tenantId.value}/event/${eventId}/detail`, {
    transform: res => ({
        ...res.data,
    }),
})
const event = computed<TenantEvent>(() => data.value ?? {} as TenantEvent)

useHead({
    title: computed(() => `Check In - ${event.value ? event.value.name : 'Event'}`),
})
definePageMeta({
    layout: false,
})
</script>

<template>
    <div>
        <NuxtLayout
            name="scan"
        >
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
                    <template v-if="targetParticipant.customAttributes.length">
                        <h2
                            v-for="(attr, id) in targetParticipant.customAttributes"
                            :key="id"
                        >
                            {{ attr.name }}: {{ attr.value }}
                        </h2>
                    </template>
                </template>
            </ModalCheckInSuccess>

            <ModalCheckInFailed
                v-model:open="checkInFailedDialog"
                :message="errorMessage"
            />
        </NuxtLayout>
    </div>
</template>
