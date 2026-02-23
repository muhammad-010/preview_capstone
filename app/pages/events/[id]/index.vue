<script setup lang="ts">
import { formatPercentage } from '~~/shared/utils/format.methods'

const route = useRoute()
const id = Number(route.params.id)
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
]

async function useDetail(tId: number, id: number) {
    const statusColors = TENANT_EVENT_STATUS_COLORS

    const { data, refresh } = await useFetch(`/api/tenant/${tId}/event/${id}/detail`, {
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
        statusColors,
        event,
        refresh,
        checkInProgressLabel,
        checkInPercentage,
    }
}

async function useList(tId: number, id: number) {
    const search = ref('')
    const query = ref('')
    const page = ref(1)
    const limit = ref(5)
    const importDialog = ref(false)
    const uploadFile = ref<File | null>(null)
    const selectedIds = ref<number[]>([])
    const toast = useToast()

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

    async function downloadTemplate() {
        try {
            await useDownload(
                `/api/files/${FILE_IMPORT_PARTICIPANT}`,
                FILE_IMPORT_PARTICIPANT,
            )
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to download template',
                color: 'error',
            })
            console.error('Download template error', error)
        }
    }

    async function uploadTemplate(tId: number, id: number) {
        if (!uploadFile.value) return

        const body = new FormData()
        body.append('file', uploadFile.value)
        try {
            await $fetch(`/api/tenant/${tId}/event/${id}/participant/bulk`, {
                method: 'POST',
                body,
            })
            importDialog.value = false
            refresh()
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to upload participants',
                color: 'error',
            })
            console.error('Upload participants error', error)
        }
    }

    async function printQr(tId: number, id: number) {
        const ids = selectedIds.value.length > 0 ? selectedIds.value.join(',') : null
        try {
            const { data } = await useFetch(`/api/tenant/${tId}/event/${id}/participant/print`, {
                transform: res => res.data,
                query: { ids },
            })
            if (data.value && data.value.filepath) {
                await useDownload(
                    `/api/files/${data.value?.filepath}`,
                    FILE_IMPORT_PARTICIPANT,
                )
            }
            else {
                toast.add({
                    title: 'Error',
                    description: 'Cannot read filepath',
                    color: 'error',
                })
                console.error('Print QR error: can\'t read filepath')
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to print QR',
                color: 'error',
            })
            console.error('Print QR error', error)
        }
    }

    return {
        search,
        page,
        limit,
        importDialog,
        uploadFile,
        selectedIds,
        toast,
        participants,
        total,
        pending,
        refresh,
        searchEvent,
        clearSearch,
        downloadTemplate,
        uploadTemplate,
        printQr,
    }
}

const [
    {
        statusColors,
        event,
        refresh: refreshDetail,
        checkInProgressLabel,
        checkInPercentage,
    },
    {
        search,
        page,
        limit,
        importDialog,
        uploadFile,
        selectedIds,
        participants,
        total,
        pending,
        refresh: refreshParticipants,
        searchEvent,
        clearSearch,
        downloadTemplate,
        uploadTemplate,
        printQr,
    },
] = await Promise.all([
    useDetail(tenantId.value, id),
    useList(tenantId.value, id),
])

useHead({
    title: `Event - ${event.value.name}`,
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {
    [':id']: {
        param: route.params.id as string,
        label: event.value.name,
    },
}))

async function uploadParticipants() {
    await uploadTemplate(tenantId.value, id)
    await Promise.all([
        refreshDetail(),
        refreshParticipants(),
    ])
}
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
                                        @click="importDialog = true"
                                    >
                                        Import
                                    </UButton>
                                    <UButton
                                        color="neutral"
                                        variant="outline"
                                        icon="lucide:qr-code"
                                        class="cursor-pointer"
                                        @click="printQr(tenantId, id)"
                                    >
                                        Print QR
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

                        {{ selectedIds }}
                        <TableEventParticipant
                            v-model:limit="limit"
                            v-model:page="page"
                            v-model:selected="selectedIds"
                            :data="participants"
                            :total="total"
                            :pending="pending"
                            with-pagination
                        />
                    </UCard>
                </div>
            </template>
        </UTabs>

        <UModal v-model:open="importDialog">
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
                                @click="downloadTemplate"
                            />
                        </div>
                    </div>
                </UCard>

                <UFileUpload
                    v-model="uploadFile"
                    icon="lucide:file-spreadsheet"
                    highlight
                    label="Click to upload or Drop your files here"
                    description="XLSX only"
                    class="cursor-pointer"
                    :accept="FILE_EXT_XLSX"
                />
            </template>

            <template #footer>
                <div class="flex justify-end items-center">
                    <div class="flex gap-2">
                        <UButton
                            color="neutral"
                            variant="outline"
                            icon="lucide:x"
                            class="cursor-pointer"
                            label="Cancel"
                            @click="importDialog = false"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            label="Upload"
                            @click="uploadParticipants"
                        />
                    </div>
                </div>
            </template>
        </UModal>
    </div>
</template>
