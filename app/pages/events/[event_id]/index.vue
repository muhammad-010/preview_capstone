<script setup lang="ts">
import { formatCapitalize } from '~~/shared/utils/format.methods'

const { $api } = useNuxtApp()
const router = useRouter()
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
]
const toast = useToast()
const { customAttributes } = await useCustomAttrFind(tenantId.value, id)

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

async function useDeleteData(tId: number, id: number) {
    const deleteConfirmation = ref(false)
    const deleteLoading = ref(false)

    async function deleteData() {
        try {
            deleteLoading.value = true
            const data = await $api(`/api/tenant/${tId}/event/${id}`, {
                method: 'DELETE',
            })
            if (data.success) {
                toast.add({
                    title: 'Success',
                    description: 'An event has been deleted',
                    color: 'success',
                })
                router.go(-1)
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to delete event',
                color: 'error',
            })
            console.error('Delete event error', error)
        }
        finally {
            deleteLoading.value = false
        }
    }

    return {
        deleteConfirmation,
        deleteLoading,
        deleteData,
    }
}

async function useList(tId: number, id: number) {
    const search = ref('')
    const query = ref('')
    const page = ref(1)
    const limit = ref(5)
    const selectedIds = ref<number[]>([])
    const filterDialog = ref(false)
    const filterCustomAttribute = ref<CustomAttribute[]>([...customAttributes.value])

    const { data, pending, refresh } = await useApi(`/api/tenant/${tId}/event/${id}/participant`, {
        transform: res => res.data,
        query: computed(() => {
            const cleanedFilterCustomAttribute = formatCleanCustomAttribute(filterCustomAttribute.value)
            return {
                query: query.value,
                page: page.value,
                limit: limit.value,
                ...(cleanedFilterCustomAttribute.length
                    ? {
                            custom_attribute_ids: cleanedFilterCustomAttribute.map(attr => attr.custom_attribute_id).join(','),
                            custom_attribute_values: cleanedFilterCustomAttribute.map(attr => attr.value).join(','),
                        }
                    : {}),
            }
        }),
        watch: false,
    })
    const participants = computed<Participant[]>(() => data.value?.participant ?? [])
    const total = computed(() => data.value?.total_data ?? 0)
    watch(page, () => refresh())
    watch(limit, () => refresh())

    function searchParticipant() {
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

    function applyFilter(close: () => void) {
        close()
        refresh()
    }

    function closeFilter(close: () => void) {
        close()
        filterCustomAttribute.value = filterCustomAttribute.value.map(attr => ({ ...attr, value: '' }))
    }

    return {
        search,
        page,
        limit,
        selectedIds,
        filterDialog,
        filterCustomAttribute,
        toast,
        participants,
        total,
        pending,
        refresh,
        searchParticipant,
        clearSearch,
        applyFilter,
        closeFilter,
    }
}

async function useImportFile(tId: number, id: number) {
    const importDialog = ref(false)
    const downloadLoading = ref(false)
    const uploadLoading = ref(false)
    const uploadFile = ref<File | null>(null)

    async function downloadTemplate() {
        try {
            downloadLoading.value = true
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
        finally {
            downloadLoading.value = false
        }
    }

    async function uploadTemplate() {
        if (!uploadFile.value) return

        const body = new FormData()
        body.append('file', uploadFile.value)
        try {
            uploadLoading.value = true
            await $api(`/api/tenant/${tId}/event/${id}/participant/bulk`, {
                method: 'POST',
                body,
            })
            importDialog.value = false
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to upload participants',
                color: 'error',
            })
            console.error('Upload participants error', error)
        }
        finally {
            uploadLoading.value = false
        }
    }

    return {
        importDialog,
        downloadLoading,
        uploadLoading,
        uploadFile,
        downloadTemplate,
        uploadTemplate,
    }
}

async function usePrintQr(tId: number, id: number) {
    const printConfirmation = ref(false)
    const printLoading = ref(false)

    async function printQr(selIds: number[]) {
        const ids = selIds.length > 0 ? selIds : []
        try {
            printLoading.value = true
            const { data } = await useApi(`/api/tenant/${tId}/event/${id}/participant/invitation/print`, {
                method: 'POST',
                transform: res => res.data,
                body: ids.length ? { participant_ids: ids } : {},
            })
            if (data.value && data.value.filepath) {
                const filename = data.value.filepath.split('/').pop()
                if (!filename) {
                    toast.add({
                        title: 'Error',
                        description: 'Cannot read filename',
                        color: 'error',
                    })
                    console.error('Print QR error: can\'t read filename')
                    return
                }
                await useDownload(
                    `/api/files/${data.value?.filepath}`,
                    filename,
                )
            }
            else {
                toast.add({
                    title: 'Error',
                    description: 'Cannot read filepath',
                    color: 'error',
                })
                console.error('Print QR error: can\'t read filepath')
                return
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
        finally {
            printConfirmation.value = false
            printLoading.value = false
        }
    }

    return {
        printConfirmation,
        printLoading,
        printQr,
    }
}

async function useSendQr(tId: number, id: number) {
    const sendConfirmation = ref(false)
    const sendLoading = ref(false)
    const sendChannels = ref(SEND_CHANNEL_DROPDOWN)
    const selectedSendChannel = ref<SendChannel[]>([])

    async function sendQr(selIds: number[]) {
        const ids = selIds.length > 0 ? selIds : []
        try {
            sendLoading.value = true
            await $api(`/api/tenant/${tId}/event/${id}/participant/invitation/send`, {
                method: 'POST',
                body: ids.length
                    ? { channel: selectedSendChannel.value, participant_ids: ids }
                    : { channel: selectedSendChannel.value },
            })
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to send QR',
                color: 'error',
            })
            console.error('Send QR error', error)
        }
        finally {
            sendConfirmation.value = false
            sendLoading.value = false
        }
    }

    return {
        sendConfirmation,
        sendLoading,
        sendChannels,
        selectedSendChannel,
        sendQr,
    }
}

const [
    {
        statusColors,
        event,
        refresh: refreshDetail,
        checkInProgressLabel,
        checkInPercentage,
        totalCheckedIn,
        totalRegistered,
    },

    {
        deleteLoading,
        deleteConfirmation,
        deleteData,
    },

    {
        search,
        page,
        limit,
        selectedIds,
        filterDialog,
        filterCustomAttribute,
        participants,
        total,
        pending,
        refresh: refreshParticipants,
        searchParticipant,
        clearSearch,
        applyFilter,
        closeFilter,
    },

    {
        importDialog,
        downloadLoading,
        uploadLoading,
        uploadFile,
        downloadTemplate,
        uploadTemplate,
    },

    {
        printConfirmation,
        printLoading,
        printQr,
    },

    {
        sendConfirmation,
        sendLoading,
        sendChannels,
        selectedSendChannel,
        sendQr,
    },
] = await Promise.all([
    useDetail(tenantId.value, id),
    useDeleteData(tenantId.value, id),
    useList(tenantId.value, id),
    useImportFile(tenantId.value, id),
    usePrintQr(tenantId.value, id),
    useSendQr(tenantId.value, id),
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

async function refreshAll() {
    selectedIds.value = []
    await Promise.all([
        refreshDetail(),
        refreshParticipants(),
    ])
}

async function uploadParticipants() {
    await uploadTemplate()
    await refreshAll()
}

async function printSelectedQr() {
    await printQr(selectedIds.value)
    await refreshAll()
}

async function sendSelectedQr() {
    await sendQr(selectedIds.value)
    await refreshAll()
}
</script>

<template>
    <div class="my-8">
        <UTabs
            :items="tabs"
            variant="link"
            size="xl"
        >
            <template #overview>
                <div class="grid grid-cols-3 gap-4 my-8">
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
                        title="Attendance Rate"
                        :total="checkInPercentage"
                        percentage
                        icon="lucide:user-check"
                    />
                </div>

                <UCard class="mb-8">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <h3>Detailed Information</h3>

                            <div class="flex items-center gap-2">
                                <UButton
                                    color="neutral"
                                    variant="outline"
                                    icon="lucide:gift"
                                    class="cursor-pointer"
                                    :disabled="!SCANNABLE_EVENT.includes(event.status)"
                                    :to="`/lottery/${event.event_id}`"
                                >
                                    Draw Lottery
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
                        <UButton
                            color="error"
                            icon="lucide:trash"
                            class="cursor-pointer"
                            @click="deleteConfirmation = true"
                        >
                            Delete Event
                        </UButton>
                    </section>
                </CardDangerZone>

                <ModalConfirmNegativeAction
                    v-model:open="deleteConfirmation"
                    title="Delete Confirmation"
                    :body="`Are you sure you want to delete ${event.name}? This action cannot be undone`"
                    :loading="deleteLoading"
                    @confirm="deleteData"
                />
            </template>

            <template #attendees>
                <div class="my-8">
                    <UCard>
                        <template #header>
                            <div class="card-toolbar">
                                <InputSearch
                                    v-model="search"
                                    class="card-toolbar-left"
                                    @search="searchParticipant"
                                    @clear="clearSearch"
                                />

                                <div class="card-toolbar-actions">
                                    <UButton
                                        color="neutral"
                                        variant="outline"
                                        icon="lucide:filter"
                                        class="cursor-pointer"
                                        @click="filterDialog = true"
                                    >
                                        Filter
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
                                        @click="importDialog = true"
                                    >
                                        Import
                                    </UButton>
                                    <UButton
                                        color="neutral"
                                        variant="outline"
                                        icon="lucide:qr-code"
                                        class="cursor-pointer"
                                        @click="printConfirmation = true"
                                    >
                                        {{ `Print QR ${selectedIds.length ? `(${selectedIds.length})` : ''}` }}
                                    </UButton>
                                    <UButton
                                        color="neutral"
                                        variant="outline"
                                        icon="lucide:send"
                                        class="cursor-pointer"
                                        @click="sendConfirmation = true"
                                    >
                                        {{ `Send QR ${selectedIds.length ? `(${selectedIds.length})` : ''}` }}
                                    </UButton>
                                    <UButton
                                        color="primary"
                                        icon="lucide:plus"
                                        class="cursor-pointer"
                                        :to="`/events/${id}/participant/add`"
                                    >
                                        Add Attendee
                                    </UButton>
                                </div>
                            </div>
                        </template>

                        <TableEventParticipant
                            v-model:limit="limit"
                            v-model:page="page"
                            v-model:selected="selectedIds"
                            :event-id="id"
                            :data="participants"
                            :total="total"
                            :pending="pending"
                            with-pagination
                            @refresh="refreshAll"
                        />
                    </UCard>
                </div>
            </template>
        </UTabs>

        <UModal v-model:open="filterDialog">
            <template #header="{ close }">
                <div class="flex justify-between items-center w-full">
                    <h5>Filter Attendees</h5>

                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="lucide:x"
                        @click="() => closeFilter(close)"
                    />
                </div>
            </template>

            <template #body>
                <DetailSectionTitle
                    title="Custom Attributes"
                    with-separator
                />

                <div class="px-4">
                    <UFormField
                        v-for="(item, index) in filterCustomAttribute"
                        :key="index"
                        :label="item.name"
                        class="mb-4 w-full"
                    >
                        <UInput
                            v-model="filterCustomAttribute![index]!.value"
                            type="string"
                            class="w-full"
                        >
                            <template #trailing>
                                <UButton
                                    v-if="filterCustomAttribute![index]!.value"
                                    color="neutral"
                                    variant="link"
                                    size="sm"
                                    icon="lucide:x"
                                    @click="filterCustomAttribute![index]!.value = ''"
                                />
                            </template>
                        </UInput>
                    </UFormField>
                </div>
            </template>

            <template #footer="{ close }">
                <div class="flex justify-end items-center w-full">
                    <div class="flex gap-2">
                        <UButton
                            color="neutral"
                            variant="outline"
                            icon="lucide:x"
                            class="cursor-pointer"
                            label="Cancel"
                            @click="() => closeFilter(close)"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            label="Apply Filter"
                            @click="() => applyFilter(close)"
                        />
                    </div>
                </div>
            </template>
        </UModal>

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
                <MiscLoadingOverlay :loading="downloadLoading">
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
                </MiscLoadingOverlay>

                <MiscLoadingOverlay :loading="uploadLoading">
                    <UFileUpload
                        v-model="uploadFile"
                        icon="lucide:file-spreadsheet"
                        highlight
                        label="Click to upload or Drop your files here"
                        description="XLSX only"
                        class="cursor-pointer"
                        :accept="FILE_EXT_XLSX"
                    />
                </MiscLoadingOverlay>
            </template>

            <template #footer>
                <div class="flex justify-end items-center w-full">
                    <div class="flex gap-2">
                        <UButton
                            color="neutral"
                            variant="outline"
                            icon="lucide:x"
                            class="cursor-pointer"
                            label="Cancel"
                            :disabled="downloadLoading || uploadLoading"
                            @click="importDialog = false"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            label="Upload"
                            :disabled="downloadLoading || uploadLoading"
                            @click="uploadParticipants"
                        />
                    </div>
                </div>
            </template>
        </UModal>

        <ModalConfirmNeutralAction
            v-model:open="printConfirmation"
            title="Print QR Confirmation"
            :body="`You will print ${selectedIds.length || 'All'} QR code of participants, Continue?`"
            confirm-label="Yes, Print The QR"
            :loading="printLoading"
            @confirm="printSelectedQr"
        />

        <ModalConfirmNeutralAction
            v-model:open="sendConfirmation"
            title="Send QR Confirmation"
            confirm-label="Yes, Send The QR"
            :loading="sendLoading"
            @confirm="sendSelectedQr"
        >
            <div>
                {{ `You will send ${selectedIds.length || 'All'} QR code of participants, Continue?` }}
                <USeparator class="my-4" />
                <UCheckboxGroup
                    v-model="selectedSendChannel"
                    :items="sendChannels"
                    variant="card"
                    indicator="end"
                    :ui="{ fieldset: 'gap-2' }"
                >
                    <template #label="{ item: { id: scId } }">
                        {{ formatCapitalize(scId.split(':')[1] || '') }}
                    </template>
                </UCheckboxGroup>
            </div>
        </ModalConfirmNeutralAction>
    </div>
</template>
