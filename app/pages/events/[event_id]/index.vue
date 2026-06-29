<script setup lang="ts">
const route = useRoute()
const eventId = Number(route.params.event_id)
const { tenantId } = useUserState()
const tabs = [
    {
        label: 'Overview',
        slot: 'overview',
    },
    {
        label: 'Store',
        slot: 'store',
    },
    {
        label: 'Sessions',
        slot: 'sessions',
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
const { customAttributes, refreshCustomAttributes } = await useFindCustomAttribute(tenantId.value, eventId)
const { event } = await useEventInfo(tenantId.value, eventId)
const eventName = computed(() => event.value.name ?? '')
const storeId = ref<number | null>(null)

const settings = [
    {
        label: 'Custom Attributes',
        slot: 'custom-attributes',
    },
    {
        label: 'Additional Features',
        slot: 'additional-features',
    },
    {
        label: 'Key Visuals',
        slot: 'key-visuals',
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

const certificateActive = ref(false)

useHead({
    title: computed(() => `Event - ${event.value ? event.value.name : 'Detail'}`),
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {
    [':event_id']: {
        param: route.params.event_id as string,
        label: eventName.value,
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
                    v-model:store-id="storeId"
                    :tenant-id="tenantId"
                    :event-id="eventId"
                />
            </template>

            <template #store>
                <PageStoreDetail
                    v-model:store-id="storeId"
                    :tenant-id="tenantId"
                    :event-id="eventId"
                    :event-title="eventName"
                    @refresh="refreshDetail"
                />
            </template>

            <template #sessions>
                <PageSessionList
                    :tenant-id="tenantId"
                    :event-id="eventId"
                    @refresh="refreshParticipant"
                />
            </template>

            <template #attendees>
                <PageParticipantList
                    ref="participantRef"
                    :tenant-id="tenantId"
                    :event-id="eventId"
                    :custom-attributes="customAttributes"
                    @refresh="refreshDetail"
                />
            </template>

            <template #settings>
                <UAccordion
                    :items="settings"
                    :unmount-on-hide="false"
                    type="multiple"
                    :ui="{ trigger: 'text-lg font-bold cursor-pointer', trailingIcon: 'hidden' }"
                >
                    <template #leading>
                        <UIcon
                            name="lucide:chevron-down"
                            class="shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200"
                        />
                    </template>

                    <template #custom-attributes>
                        <PageCustomAttributeList
                            :tenant-id="tenantId"
                            :event-id="eventId"
                            :custom-attributes="customAttributes"
                            @refresh="onRefreshCustomAttributeList"
                        />
                    </template>

                    <template #additional-features>
                        <PageEventSetting
                            v-model:certificate-active="certificateActive"
                            :tenant-id="tenantId"
                            :event-id="eventId"
                            @refresh="refreshDetail"
                        />
                    </template>

                    <template #key-visuals>
                        <PageEventKeyVisual
                            v-model:certificate-active="certificateActive"
                            :event-id="eventId"
                        />
                    </template>
                </UAccordion>
            </template>
        </UTabs>
    </div>
</template>
