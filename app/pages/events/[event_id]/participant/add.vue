<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()
const eventId = Number(route.params.event_id)
const { event } = await useEventInfo(tenantId.value, eventId)

useHead({
    title: 'Participant - Add',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {
    [':id']: {
        param: route.params.id as string,
        label: event.value.name,
    },
}))
</script>

<template>
    <div class="my-8">
        <FormAttendee
            :event-id="eventId"
        />
    </div>
</template>
