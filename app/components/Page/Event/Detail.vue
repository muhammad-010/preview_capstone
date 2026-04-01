<script setup lang="ts">
const statusColors = TENANT_EVENT_STATUS_COLORS

const props = defineProps<{
    tenantId: number
    event: TenantEvent
}>()

const checkInProgressLabel = computed(() => `
    ${props.event.participant_status?.total_checked_in || 0}
    of
    ${props.event.participant_status?.total_registered || 0}
    attendees has been checked-in
`)
</script>

<template>
    <UCard class="mb-8">
        <template #header>
            <div class="card-toolbar">
                <div class="card-toolbar-left">
                    <h3>Detailed Information</h3>
                </div>

                <div class="card-toolbar-actions">
                    <!-- <UButton
                        color="neutral"
                        variant="outline"
                        icon="lucide:gift"
                        class="cursor-pointer"
                        :disabled="!SCANNABLE_EVENT.includes(event.status)"
                        :to="`/lottery/${event.event_id}`"
                    >
                        Draw Lottery
                    </UButton> -->

                    <UButton
                        color="neutral"
                        variant="outline"
                        icon="lucide:ticket"
                        class="cursor-pointer"
                        @click="navigateTo(`/guest/show-ticket/${event.event_id}`, {
                            external: true,
                            open: { target: '_blank' },
                        })"
                    >
                        Open Public Ticketing Page
                    </UButton>

                    <UButton
                        color="primary"
                        icon="lucide:pencil"
                        class="cursor-pointer"
                        :to="`/events/${event.event_id}/edit`"
                    >
                        Edit Event
                    </UButton>
                </div>
            </div>
        </template>

        <div>
            <section class="grid md:grid-cols-2 gap-6 mb-8">
                <DetailSectionData
                    title="Start Time"
                    icon="lucide:clock"
                    :subtitle="event.start_time"
                />

                <DetailSectionData
                    title="End Time"
                    icon="lucide:clock-8"
                    :subtitle="event.end_time"
                />

                <DetailSectionData
                    title="Venue"
                    icon="lucide:map-pin"
                    :subtitle="event.location"
                />

                <DetailSectionData title="Status">
                    <UBadge
                        :color="statusColors[event.status]"
                        variant="subtle"
                        :label="event.status"
                    />
                </DetailSectionData>
            </section>

            <section>
                <DetailSectionData :title="checkInProgressLabel">
                    <UProgress
                        :model-value="event.participant_status?.total_checked_in"
                        :max="event.participant_status?.total_registered"
                    />
                </DetailSectionData>
            </section>
        </div>
    </UCard>

    <CardDangerZone>
        <section>
            <DetailSectionTitle title="Delete" />
            <p class="mb-2">
                Permanently delete this event and all associated data. This action cannot be undone
            </p>
            <PageEventDelete
                :tenant-id="tenantId"
                :event="event"
                :reroute="true"
            />
        </section>
    </CardDangerZone>
</template>
