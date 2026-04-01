<script setup lang="ts">
const { $api } = useNuxtApp()
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
const { customAttributes, refreshCustomAttributes }
    = await useFindCustomAttribute(tenantId.value, id)

async function useDetail(tId: number, id: number) {
    const { data, refresh } = await useApi(`/api/tenant/${tId}/event/${id}/detail`, {
        transform: res => ({
            ...res.data,
            start_time: formatLongDate(res.data.start_time || ''),
            end_time: formatLongDate(res.data.end_time || ''),
        }),
    })
    const event = computed<TenantEvent>(() => data.value ?? {} as TenantEvent)
    const checkInPercentage = computed(() => formatPercentage(
        event.value.participant_status?.total_checked_in || 0,
        event.value.participant_status?.total_registered || 0,
        1,
    ))
    const totalCheckedIn = computed(() => event.value.participant_status?.total_checked_in || 0)
    const totalRegistered = computed(() => event.value.participant_status?.total_registered || 0)
    const totalNotCheckedIn = computed(() => totalRegistered.value - totalCheckedIn.value)

    return {
        event,
        refresh,
        checkInPercentage,
        totalCheckedIn,
        totalRegistered,
        totalNotCheckedIn,
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
            const { data } = await $api(`/api/tenant/${tId}/event/${id}/participant/export`, {
                method: 'POST',
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
            if (data.filepath) {
                const filename = data.filepath.split('/').pop()
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
                    `/api/${data.filepath}`,
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

async function usePrintQr(tId: number, id: number) {
    const printConfirmation = ref(false)
    const printLoading = ref(false)

    async function printQr(selIds: number[]) {
        const ids = selIds.length > 0 ? selIds : []
        try {
            printLoading.value = true
            const { data } = await $api(`/api/tenant/${tId}/event/${id}/participant/invitation/print`, {
                method: 'POST',
                body: ids.length ? { participant_ids: ids } : {},
            })
            if (data.filepath) {
                const filename = data.filepath.split('/').pop()
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
                    `/api/files/${data.filepath}`,
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
        event,
        refresh: refreshDetail,
        checkInPercentage,
        totalCheckedIn,
        totalRegistered,
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
    useList(tenantId.value, id),
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

                <PageEventDetail
                    :tenant-id="tenantId"
                    :event="event"
                />
            </template>

            <template #custom-attributes>
                <PageCustomAttributeForm
                    :tenant-id="tenantId"
                    :event-id="id"
                    :custom-attributes="customAttributes"
                    @refresh="refreshCustomAttributes"
                />
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
                                    <PageEventImport
                                        :tenant-id="tenantId"
                                        :event-id="id"
                                    />
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

                        <PageParticipantTable
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
