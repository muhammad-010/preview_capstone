<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()
const eventId = Number(route.params.event_id)
const participantId = Number(route.params.participant_id)

async function useInfo(tId: number, eId: number, id: number) {
    const { data } = await useFetch(`/api/tenant/${tId}/event/${eId}/participant/${id}`, {
        transform: res => res.data,
    })
    const participant = computed<ParticipantForm>(() => data.value ?? {} as ParticipantForm)

    return { participant }
}

async function useEventInfo(tId: number, eId: number) {
    const { data } = await useFetch(`/api/tenant/${tId}/event/${eId}`, {
        transform: res => res.data,
    })
    const event = computed<TenantEventForm>(() => data.value ?? {} as TenantEventForm)

    return { event }
}

const { participant } = await useInfo(tenantId.value, eventId, participantId)
const { event } = await useEventInfo(tenantId.value, eventId)

useHead({
    title: 'Participant - Edit',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {
    [':event_id']: {
        param: route.params.event_id as string,
        label: event.value.name,
    },
    [':participant_id']: {
        param: route.params.participant_id as string,
        label: participant.value.name,
    },
}))
</script>

<template>
    <div class="my-8">
        <FormAttendee
            :id="participantId"
            :event-id="eventId"
            :fields="participant"
        />
    </div>
</template>
