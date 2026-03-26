<script setup lang="ts">
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
        label: 'Custom Attributes',
        slot: 'custom-attributes',
    },
    {
        label: 'Attendees',
        slot: 'attendees',
    },
]
const activeTab = useState(STATE_EVENT_DETAIL_ACTIVE_TAB, () => '0')
const toast = useToast()
const deleteCustomAttributeConfirmation = ref(false)
const deleteCustomAttributeTarget = ref<CustomAttribute | null>(null)
const newCustomAttribute = ref<CustomAttribute[]>([])
const { customAttributes, refreshCustomAttributes }
    = await useFindCustomAttribute(tenantId.value, id)
const {
    createCustomAttribute,
    updateCustomAttribute,
    deleteCustomAttribute,
} = await useManageCustomAttribute(tenantId.value, id)

function addNewCustomAttribute() {
    newCustomAttribute.value.push({
        name: '',
    } as CustomAttribute)
}

function removeNewCustomAttribute(index: number) {
    newCustomAttribute.value.splice(index, 1)
}

async function saveNewCustomAttribute(attr: CustomAttribute, index: number) {
    try {
        await createCustomAttribute(attr)
        newCustomAttribute.value.splice(index, 1)
        await refreshCustomAttributes()
        toast.add({
            title: 'Success',
            description: 'A custom attribute has been created!',
            color: 'success',
        })
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to add new custom attribute',
            color: 'error',
        })
        console.error('Create custom attribute error', error)
    }
}

async function editCustomAttribute(attr: CustomAttribute) {
    try {
        await updateCustomAttribute(attr)
        await refreshCustomAttributes()
        toast.add({
            title: 'Success',
            description: 'A custom attribute has been updated!',
            color: 'success',
        })
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to update custom attribute',
            color: 'error',
        })
        console.error('Update custom attribute error', error)
    }
}

function confirmRemoveCustomAttribute(attr: CustomAttribute) {
    deleteCustomAttributeTarget.value = attr
    deleteCustomAttributeConfirmation.value = true
}

function closeConfirmRemoveCustomAttribute() {
    deleteCustomAttributeTarget.value = null
    deleteCustomAttributeConfirmation.value = false
}

async function removeCustomAttribute() {
    if (!deleteCustomAttributeTarget.value) return
    try {
        await deleteCustomAttribute(deleteCustomAttributeTarget.value)
        await refreshCustomAttributes()
        toast.add({
            title: 'Success',
            description: 'A custom attribute has been deleted!',
            color: 'success',
        })
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to delete custom attribute',
            color: 'error',
        })
        console.error('Delete custom attribute error', error)
    }
    finally {
        closeConfirmRemoveCustomAttribute()
    }
}

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
    const searchPhoneNumber = ref('')
    const query = ref('')
    const phoneNumber = ref('')
    const page = ref(1)
    const limit = ref(5)
    const selectedIds = ref<number[]>([])
    const filterCustomAttribute = ref<CustomAttribute[]>(structuredClone(toRaw(unref(customAttributes.value))))
    const filterCheckedIn = ref<boolean | null>(null)

    const { data, pending, refresh } = await useApi(`/api/tenant/${tId}/event/${id}/participant`, {
        transform: res => res.data,
        query: computed(() => {
            const cleanedFilterCustomAttribute = formatCleanCustomAttribute(filterCustomAttribute.value)
            return {
                query: query.value,
                page: page.value,
                limit: limit.value,
                ...(filterCheckedIn.value !== null
                    ? { is_checked_in: filterCheckedIn.value }
                    : {}
                ),
                ...(cleanedFilterCustomAttribute.length
                    ? {
                            custom_attribute_ids: cleanedFilterCustomAttribute.map(attr => attr.custom_attribute_id).join(','),
                            custom_attribute_values: cleanedFilterCustomAttribute.map(attr => attr.value).join(','),
                        }
                    : {}),
                ...(phoneNumber.value
                    ? { phone_number: phoneNumber.value }
                    : {}
                ),
            }
        }),
        watch: false,
    })
    const participants = computed<Participant[]>(() => data.value?.participant ?? [])
    const total = computed(() => data.value?.total_data ?? 0)
    watch(page, () => refresh())
    watch(limit, () => refresh())

    async function exportData() {
        try {
            const { data } = await useApi(`/api/tenant/${tId}/event/${id}/participant/export`, {
                method: 'POST',
                transform: res => res.data,
                body: {
                    query: query.value,
                    ...(filterCheckedIn.value !== null
                        ? { is_checked_in: filterCheckedIn.value }
                        : {}
                    ),
                    custom_attribute: [...formatCleanCustomAttribute(filterCustomAttribute.value)],
                    ...(phoneNumber.value
                        ? { phone_number: phoneNumber.value }
                        : {}
                    ),
                },
            })
            if (data.value && data.value.filepath) {
                const filename = data.value.filepath.split('/').pop()
                if (!filename) {
                    toast.add({
                        title: 'Error',
                        description: 'Cannot read filename',
                        color: 'error',
                    })
                    console.error('Export participant error: can\'t read filename')
                    return
                }
                await useDownload(
                    `/api/${data.value?.filepath}`,
                    filename,
                )
            }
            else {
                toast.add({
                    title: 'Error',
                    description: 'Cannot read filepath',
                    color: 'error',
                })
                console.error('Export participant error: can\'t read filepath')
                return
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to export participant',
                color: 'error',
            })
            console.error('Export participant error', error)
        }
    }

    function searchParticipant() {
        page.value = 1
        query.value = search.value
        refresh()
    }

    function searchParticipantPhoneNumber() {
        page.value = 1
        phoneNumber.value = searchPhoneNumber.value
        refresh()
    }

    function clearSearch() {
        page.value = 1
        search.value = ''
        query.value = search.value
        refresh()
    }

    function clearSearchPhoneNumber() {
        page.value = 1
        searchPhoneNumber.value = ''
        query.value = search.value
        refresh()
    }

    return {
        search,
        searchPhoneNumber,
        page,
        limit,
        selectedIds,
        filterCustomAttribute,
        filterCheckedIn,
        toast,
        participants,
        total,
        pending,
        refresh,
        exportData,
        searchParticipant,
        searchParticipantPhoneNumber,
        clearSearch,
        clearSearchPhoneNumber,
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
        searchPhoneNumber,
        page,
        limit,
        selectedIds,
        filterCustomAttribute,
        filterCheckedIn,
        participants,
        total,
        pending,
        refresh: refreshParticipants,
        exportData,
        searchParticipant,
        searchParticipantPhoneNumber,
        clearSearch,
        clearSearchPhoneNumber,
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
            v-model="activeTab"
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

                <div class="mb-8">
                    <UCard>
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
                </div>

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

            <template #custom-attributes>
                <div class="my-8">
                    <UCard>
                        <template #header>
                            <div class="card-toolbar">
                                <div class="card-toolbar-left">
                                    <h3>Manage Custom Attributes</h3>
                                </div>

                                <div class="card-toolbar-actions">
                                    <UButton
                                        color="primary"
                                        icon="lucide:plus"
                                        class="cursor-pointer"
                                        @click="addNewCustomAttribute"
                                    >
                                        Add Attributes
                                    </UButton>
                                </div>
                            </div>
                        </template>

                        <div
                            v-for="(attr, i) in newCustomAttribute"
                            :key="i"
                            class="flex items-center my-4"
                        >
                            <UInput
                                v-model="attr.name"
                                class="flex-1"
                            />

                            <div class="flex justify-between gap-4 ml-4">
                                <UButton
                                    icon="lucide:save"
                                    label="Create"
                                    @click="saveNewCustomAttribute(attr, i)"
                                />
                                <UButton
                                    color="neutral"
                                    variant="outline"
                                    icon="lucide:ban"
                                    label="Cancel"
                                    @click="removeNewCustomAttribute(i)"
                                />
                            </div>
                        </div>

                        <div
                            v-for="attr in customAttributes"
                            :key="attr.custom_attribute_id"
                            class="flex items-center my-4"
                        >
                            <UInput
                                v-model="attr.name"
                                class="flex-1"
                            />

                            <div class="flex justify-between gap-4 ml-4">
                                <UButton
                                    color="neutral"
                                    variant="outline"
                                    icon="lucide:pencil"
                                    label="Update"
                                    @click="editCustomAttribute(attr)"
                                />
                                <UButton
                                    color="error"
                                    variant="outline"
                                    icon="lucide:trash"
                                    label="Delete"
                                    @click="confirmRemoveCustomAttribute(attr)"
                                />
                            </div>
                        </div>
                    </UCard>

                    <ModalConfirmNegativeAction
                        v-model:open="deleteCustomAttributeConfirmation"
                        title="Delete Custom Attribute"
                        :body="`Are you sure want to delete ${deleteCustomAttributeTarget?.name}? This action can not be undone.`"
                        confirm-label="Yes, Delete Custom Attribute"
                        :loading="printLoading"
                        @cancel="closeConfirmRemoveCustomAttribute"
                        @confirm="removeCustomAttribute"
                    />
                </div>
            </template>

            <template #attendees>
                <div class="my-8">
                    <UCard>
                        <template #header>
                            <div class="card-toolbar">
                                <div class="card-toolbar-left-wrapper">
                                    <InputSearch
                                        v-model="search"
                                        class="card-toolbar-left"
                                        placeholder="Search Name"
                                        @search="searchParticipant"
                                        @clear="clearSearch"
                                    />

                                    <InputSearch
                                        v-model="searchPhoneNumber"
                                        class="card-toolbar-left"
                                        placeholder="Search Phone Number"
                                        @search="searchParticipantPhoneNumber"
                                        @clear="clearSearchPhoneNumber"
                                    />
                                </div>

                                <div class="card-toolbar-actions">
                                    <UButton
                                        color="neutral"
                                        variant="outline"
                                        icon="lucide:download"
                                        class="cursor-pointer"
                                        @click="exportData"
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
                            v-model:filter-custom-attribute="filterCustomAttribute"
                            v-model:filter-checked-in="filterCheckedIn"
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
