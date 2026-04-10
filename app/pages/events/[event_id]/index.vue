<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.event_id)
const { tenantId } = useUserState()
const tabs = [
    {
        label: 'Overview',
        slot: 'overview',
    },
    {
        label: 'Custom Attributes',
        slot: 'custom-attributes',
    },
    {
        label: 'Attendees',
        slot: 'attendees',
    },
]
const activeTab = useState(STATE_EVENT_DETAIL_ACTIVE_TAB, () => '0')
const { customAttributes, refreshCustomAttributes } = await useFindCustomAttribute(tenantId.value, id)
const { event } = await useEventInfo(tenantId.value, id)

const overviewRef = ref()
function refreshDetail() {
    overviewRef.value.refresh()
}

useHead({
    title: computed(() => `Event - ${event.value ? event.value.name : 'Detail'}`),
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
        <UTabs
            v-model="activeTab"
            :items="tabs"
            variant="link"
            size="xl"
        >
            <template #overview>
                <PageEventOverview
                    ref="overviewRef"
                    :tenant-id="tenantId"
                    :event-id="id"
                />
            </template>

            <template #custom-attributes>
                <PageCustomAttributeList
                    :tenant-id="tenantId"
                    :event-id="id"
                    :custom-attributes="customAttributes"
                    @refresh="refreshCustomAttributes"
                />
            </template>

            <template #attendees>
                <PageParticipantList
                    :tenant-id="tenantId"
                    :event-id="id"
                    :custom-attributes="customAttributes"
                    @refresh="refreshDetail"
                />
            </template>
        </UTabs>
    </div>
</template>
