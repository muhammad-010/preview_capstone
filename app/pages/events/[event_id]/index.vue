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
        label: 'Attendees',
        slot: 'attendees',
    },
    {
        label: 'Settings',
        slot: 'settings',
    },
]
const activeTab = useState(STATE_EVENT_DETAIL_ACTIVE_TAB, () => '0')
const { customAttributes, refreshCustomAttributes } = await useFindCustomAttribute(tenantId.value, id)
const { event } = await useEventInfo(tenantId.value, id)

const settings = [
    {
        label: 'Custom Attributes',
        slot: 'custom-attributes',
    },
]

const overviewRef = ref()
function refreshDetail() {
    overviewRef.value.refresh()
}

const participantRef = ref()
function refreshParticipant() {
    participantRef.value.refresh()
}

function onRefreshCustomAttributeList() {
    refreshCustomAttributes()
    refreshParticipant()
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
            :unmount-on-hide="false"
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

            <template #attendees>
                <PageParticipantList
                    ref="participantRef"
                    :tenant-id="tenantId"
                    :event-id="id"
                    :custom-attributes="customAttributes"
                    @refresh="refreshDetail"
                />
            </template>

            <template #settings>
                <UAccordion
                    :items="settings"
                    :unmount-on-hide="false"
                    :ui="{ trigger: 'text-lg font-bold cursor-pointer', trailingIcon: 'hidden' }"
                >
                    <template #leading>
                        <UIcon
                            name="lucide:chevron-down"
                            size="5"
                            class="shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200"
                        />
                    </template>
                    <template #custom-attributes>
                        <PageCustomAttributeList
                            :tenant-id="tenantId"
                            :event-id="id"
                            :custom-attributes="customAttributes"
                            @refresh="onRefreshCustomAttributeList"
                        />
                    </template>
                </UAccordion>
            </template>
        </UTabs>
    </div>
</template>
