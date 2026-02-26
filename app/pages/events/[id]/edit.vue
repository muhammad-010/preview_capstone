<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()
const id = Number(route.params.id)

async function useInfo(tId: number, id: number) {
    const { data } = await useFetch(`/api/tenant/${tId}/event/${id}`, {
        transform: res => res.data,
    })
    const event = computed<TenantEventForm>(() => data.value ?? {} as TenantEventForm)

    return { event }
}

const { event } = await useInfo(tenantId.value, id)

useHead({
    title: 'Event - Edit',
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
        <FormEvent
            :id="id"
            :fields="event"
        />
    </div>
</template>
