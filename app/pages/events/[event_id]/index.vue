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
                    :event-id="eventId"
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
                            :tenant-id="tenantId"
                            :event-id="eventId"
                            @refresh="refreshDetail"
                        />
                    </template>

                    <template #key-visuals>
                        <div class="flex gap-4 w-full">
                            <UCard class="w-full">
                                <template #header>
                                    <h4>Invitation QR Code</h4>
                                </template>

                                Customize the digital ticket that attendees receive. You can add their name, ticket type, and the scannable QR code.
                            </UCard>

                            <UCard class="w-full">
                                <template #header>
                                    <h4>Scan QR Page</h4>
                                </template>

                                Customize the screen shown to POCs or attendees during the check-in process.

                                <template #footer>
                                    <div class="w-full">
                                        <UButton
                                            color="neutral"
                                            variant="outline"
                                            label="Edit Design"
                                            size="xl"
                                            icon="lucide:pencil"
                                            class="w-full"
                                            :ui="{ base: 'p-3' }"
                                            :to="`/events/${eventId}/check-in-page-editor`"
                                        />
                                    </div>
                                </template>
                            </UCard>
                        </div>
                    </template>
                </UAccordion>
            </template>
        </UTabs>
    </div>
</template>
