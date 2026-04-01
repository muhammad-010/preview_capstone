<script setup lang="ts">
import { formatPercentage } from '~~/shared/utils/format.methods'

const route = useRoute()
const id = Number(route.params.event_id)
const { tenantId } = useUserState()

async function useDetail(tId: number, id: number) {
    const statusColors = TENANT_EVENT_STATUS_COLORS
    const { data, refresh } = await useApi(`/api/tenant/${tId}/event/${id}/detail`, {
        transform: res => ({
            ...res.data,
            start_time: formatLongDate(res.data.start_time || ''),
            end_time: formatLongDate(res.data.end_time || ''),
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
    const totalCheckedIn = computed(() => event.value.participant_status?.total_checked_in || 0)
    const totalRegistered = computed(() => event.value.participant_status?.total_registered || 0)
    const totalNotCheckedIn = computed(() => totalRegistered.value - totalCheckedIn.value)

    return {
        statusColors,
        event,
        refresh,
        checkInProgressLabel,
        checkInPercentage,
        totalCheckedIn,
        totalRegistered,
        totalNotCheckedIn,
    }
}

async function useList(tId: number, id: number) {
    const search = ref('')
    const query = ref('')
    const page = ref(1)
    const limit = ref(5)
    const toast = useToast()
    const { data, pending, refresh } = await useApi(`/api/tenant/${tId}/event/${id}/participant`, {
        transform: res => res.data,
        query: { query, page, limit },
        watch: [page, limit],
    })
    const participants = computed<Participant[]>(() => data.value?.participant ?? [])
    const total = computed(() => data.value?.total_data ?? 0)

    function searchEvent() {
        page.value = 1
        query.value = search.value
        refresh()
    }

    function clearSearch() {
        page.value = 1
        search.value = ''
        query.value = search.value
        refresh()
    }

    return {
        search,
        page,
        limit,
        toast,
        participants,
        total,
        pending,
        refresh,
        searchEvent,
        clearSearch,
    }
}

const [
    {
        statusColors,
        event,
        checkInPercentage,
        totalCheckedIn,
        totalRegistered,
        totalNotCheckedIn,
    },
    {
        search,
        page,
        limit,
        participants,
        total,
        pending,
        searchEvent,
        clearSearch,
    },
] = await Promise.all([
    useDetail(tenantId.value, id),
    useList(tenantId.value, id),
])

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
        <div class="grid grid-cols-4 gap-4 my-8">
            <CardTotal
                title="Total Registrations"
                :total="totalRegistered"
                icon="lucide:users"
            />

            <CardTotal
                title="Checked Ins"
                :total="totalCheckedIn"
                icon="lucide:circle-check"
            />

            <CardTotal
                title="Pending"
                :total="totalNotCheckedIn"
                icon="lucide:clock-8"
            />

            <CardTotal
                title="Attendance Rate"
                :total="checkInPercentage"
                percentage
                icon="lucide:user-check"
            />
        </div>

        <UCard class="my-8">
            <template #header>
                <div class="card-toolbar">
                    <div class="card-toolbar-left">
                        <h3>Detailed Information</h3>
                    </div>

                    <div class="card-toolbar-actions">
                        <UButton
                            color="primary"
                            icon="lucide:scan-qr-code"
                            class="cursor-pointer"
                            :disabled="!SCANNABLE_EVENT.includes(event.status)"
                            :to="`/check-in/${event.event_id}`"
                        >
                            Start Scanning
                        </UButton>
                    </div>
                </div>
            </template>

            <div>
                <section class="grid md:grid-cols-4 gap-6 mb-8">
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
            </div>
        </UCard>

        <div class="my-8">
            <UCard>
                <template #header>
                    <div class="flex justify-between items-center">
                        <InputSearch
                            v-model="search"
                            @search="searchEvent"
                            @clear="clearSearch"
                        />

                        <div class="flex gap-2">
                            <!-- <UButton
                                        color="neutral"
                                        variant="outline"
                                        icon="lucide:filter"
                                        class="cursor-pointer"
                                    >
                                        Filter
                                    </UButton> -->
                        </div>
                    </div>
                </template>

                <PageMyEventParticipantTable
                    v-model:limit="limit"
                    v-model:page="page"
                    :event-id="id"
                    :data="participants"
                    :total="total"
                    :pending="pending"
                    with-pagination
                />
            </UCard>
        </div>
    </div>
</template>
