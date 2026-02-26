<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()
const eventId = Number(route.params.id)
async function useEventInfo(tId: number, eId: number) {
    const { data } = await useFetch(`/api/tenant/${tId}/event/${eId}`, {
        transform: res => res.data,
    })
    const event = computed<TenantEventForm>(() => data.value ?? {} as TenantEventForm)

    return { event }
}
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
        <FormMember />
    </div>
</template>
