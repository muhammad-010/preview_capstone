<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()
const eventId = Number(route.params.event_id)
const { event } = await useEventInfo(tenantId.value, eventId)

useHead({
    title: 'Participant - Add',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {
    [':event_id']: {
        param: route.params.event_id as string,
        label: event.value.name,
    },
}))
</script>

<template>
    <div class="my-8">
        <PageParticipantFullForm
            :tenant-id="tenantId"
            :event-id="eventId"
        />
    </div>
</template>
