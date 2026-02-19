<script setup lang="ts">
import { formatPercentage } from '~~/shared/utils/format.methods'

const route = useRoute()
const id = Number(route.params.id)
const { tenantId } = useUserState()

async function useDetail(tId: number, id: number) {
    const tabs = [
        {
            label: 'Overview',
            slot: 'overview',
        },
        {
            label: 'Attendees',
            slot: 'attendees',
        },
    ]
    const statusColors = TENANT_EVENT_STATUS_COLORS

    const { data } = await useFetch(`/api/tenant/${tId}/event/${id}/detail`, {
        transform: res => ({
            ...res.data,
            start_time: formatShortDate(res.data.start_time || ''),
            end_time: formatShortDate(res.data.end_time || ''),
        }),
    })
    const event = computed<TenantEvent>(() => data.value ?? {} as TenantEvent)
    const checkInProgressLabel = computed(() => `
        ${event.value.participant_status?.total_checked_in || 0}
        of
        ${event.value.participant_status?.total_registered || 0}
        attendees has been checked-in
    `)
    const checkInPercentage = computed(() => formatPercentage(
        event.value.participant_status?.total_checked_in || 0,
        event.value.participant_status?.total_registered || 0,
        1,
    ))

    return {
        tabs,
        statusColors,
        event,
        checkInProgressLabel,
        checkInPercentage,
    }
}

const {
    tabs,
    statusColors,
    event,
    checkInProgressLabel,
    checkInPercentage,
} = await useDetail(tenantId.value, id)

useHead({
    title: `Event - ${event.value.name}`,
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
        <UTabs :items="tabs">
            <template #overview>
                <div class="grid grid-cols-3 gap-4 my-8">
                    <CardTotal
                        title="Total Registrations"
                        :total="event.participant_status?.total_registered || 0"
                        icon="lucide:users"
                    />

                    <CardTotal
                        title="Checked Ins"
                        :total="event.participant_status?.total_checked_in || 0"
                        icon="lucide:circle-check"
                    />

                    <CardTotal
                        title="Attendance Rate"
                        :total="checkInPercentage"
                        percentage
                        icon="lucide:clock"
                    />
                </div>

                <UCard class="mb-8">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <h3>Detailed Information</h3>

                            <div class="flex items-center gap-2">
                                <UButton
                                    color="primary"
                                    icon="lucide:pencil"
                                    class="cursor-pointer"
                                    :to="`/events/${12}/edit`"
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
                                icon="lucide:user"
                                :subtitle="event.start_time"
                            />

                            <DetailSectionData
                                title="End Time"
                                icon="lucide:mail"
                                :subtitle="event.end_time"
                            />

                            <DetailSectionData
                                title="Venue"
                                icon="lucide:phone"
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
                            <DetailSectionTitle title="Check-In Progress" />

                            <DetailSectionData :title="checkInProgressLabel">
                                <UProgress
                                    :model-value="event.participant_status?.total_checked_in"
                                    :max="event.participant_status?.total_registered"
                                />
                            </DetailSectionData>
                        </section>
                    </div>
                </UCard>
            </template>

            <template #attendees>
                Attendees
            </template>
        </UTabs>
    </div>
</template>
