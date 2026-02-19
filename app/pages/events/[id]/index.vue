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

    return {
        tabs,
        statusColors,
        event,
        checkInProgressLabel,
        checkInPercentage,
    }
}

async function useList(tId: number, id: number) {
    const search = ref('')
    const query = ref('')
    const page = ref(1)
    const limit = ref(5)
    const printQrDialog = ref(false)

    const { data, pending, refresh } = await useFetch(`/api/tenant/${tId}/event/${id}/participant`, {
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
        printQrDialog,
        participants,
        total,
        pending,
        searchEvent,
        clearSearch,
    }
}

const {
    tabs,
    statusColors,
    event,
    checkInProgressLabel,
    checkInPercentage,
} = await useDetail(tenantId.value, id)
const {
    search,
    page,
    limit,
    printQrDialog,
    participants,
    total,
    pending,
    searchEvent,
    clearSearch,
} = await useList(tenantId.value, id)

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
                                    <UButton
                                        color="neutral"
                                        variant="outline"
                                        icon="lucide:qr-code"
                                        class="cursor-pointer"
                                        @click="printQrDialog = true"
                                    >
                                        Print QR
                                    </UButton>
                                    <UButton
                                        color="neutral"
                                        variant="outline"
                                        icon="lucide:download"
                                        class="cursor-pointer"
                                    >
                                        Export
                                    </UButton>
                                    <UButton
                                        color="neutral"
                                        variant="outline"
                                        icon="lucide:upload"
                                        class="cursor-pointer"
                                    >
                                        Import
                                    </UButton>
                                    <UButton
                                        color="primary"
                                        icon="lucide:plus"
                                        class="cursor-pointer"
                                        to="/events/add"
                                    >
                                        Add Attendee
                                    </UButton>
                                </div>
                            </div>
                        </template>

                        <TableEventParticipant
                            v-model:limit="limit"
                            v-model:page="page"
                            :data="participants"
                            :total="total"
                            :pending="pending"
                            with-pagination
                        />
                    </UCard>
                </div>
            </template>
        </UTabs>

        <UModal
            v-model:open="printQrDialog"
        >
            <template #header="{ close }">
                <div class="flex justify-between items-center w-full">
                    <h5>Import Attendee</h5>

                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="lucide:x"
                        @click="close"
                    />
                </div>
            </template>

            <template #body>
                <UCard
                    :ui="{
                        root: 'bg-neutral-50 dark:bg-neutral-800',
                    }"
                    class="mb-4"
                >
                    <div class="flex gap-4">
                        <UIcon
                            name="lucide:file-spreadsheet"
                            class="size-8"
                        />
                        <div>
                            <div class="mb-2">
                                <h5>Download Template</h5>
                                <small>Use our CSV template to ensure your data is formatted correctly</small>
                            </div>
                            <UButton
                                icon="lucide:download"
                                label="Download Template"
                            />
                        </div>
                    </div>
                </UCard>

                <UFileUpload
                    icon="lucide:file-spreadsheet"
                    highlight
                    label="Click to upload or Drop your files here"
                    description="CSV only"
                    class="cursor-pointer"
                    accept=".csv,text/csv"
                />
            </template>
        </UModal>
    </div>
</template>
