<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()
const eventId = Number(route.params.event_id)
const { event } = await useEventInfo(tenantId.value, eventId)
event.value.start_time = new Date(event.value.start_time).toISOString()
event.value.end_time = new Date(event.value.end_time).toISOString()

useHead({
    title: 'Event - Edit',
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
        <PageEventFullForm
            v-model:fields="event"
            v-model:id="eventId"
            :tenant-id="tenantId"
        />
    </div>
</template>
