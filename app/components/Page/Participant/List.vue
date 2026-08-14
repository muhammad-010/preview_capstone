<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
    customAttributes: CustomAttribute[]
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])

const { $api } = useNuxtApp()
const { errorToast } = useErrorToast()
const search = ref('')
const query = ref('')
const page = ref(1)
const limit = ref(5)
const selectedIds = ref<number[]>([])
const filterCustomAttribute = ref<CustomAttribute[]>(cloneObject(unref(props.customAttributes)))
// const filterCheckedIn = ref<boolean | null>(null)
const filterSessionStatus = ref<TenantEventTicketSessionStatus | null>(null)

const exposed = {
    refresh: () => {},
}
defineExpose(exposed)
const { data, pending, refresh } = await useApi(`/api/tenant/${props.tenantId}/event/${props.eventId}/ticket`, {
    transform: res => res.data,
    query: computed(() => {
        const cleanedFilterCustomAttribute = formatCleanCustomAttribute(filterCustomAttribute.value)
        return {
            query: query.value,
            page: page.value,
            limit: limit.value,
            // ...(filterCheckedIn.value !== null
            //     ? { is_checked_in: filterCheckedIn.value }
            //     : {}
            // ),
            ...(filterSessionStatus.value !== null
                ? { check_in_session: filterSessionStatus.value }
                : {}
            ),
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
exposed.refresh = refresh
const tableRef = ref()

const tickets = computed<TenantEventTicket[]>(() => data.value?.ticket ?? [])
const total = computed(() => data.value?.total_data ?? 0)
watch(page, () => refresh())
watch(limit, () => refresh())

// EXPORTION
async function exportData() {
    try {
        const { data } = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/ticket/export`, {
            method: 'POST',
            body: {
                query: query.value,
                // ...(filterCheckedIn.value !== null
                //     ? { is_checked_in: filterCheckedIn.value }
                //     : {}
                // ),
                ...(filterSessionStatus.value !== null
                    ? { check_in_session: filterSessionStatus.value }
                    : {}
                ),
                custom_attribute: [...formatCleanCustomAttribute(filterCustomAttribute.value)],
            },
        })
        if (data.url) {
            downloadFileUrl(data.url)
            /*
            const filename = data.filepath.split('/').pop()
            if (!filename) {
                errorToast({ description: 'Cannot read filename from filepath' })
                return
            }
            await useDownload(
                `/api/files/${data.filepath}`,
                filename,
            )
            */
        }
        else {
            errorToast({ description: 'Cannot read url' })
            return
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to export participant' })
    }
}

function searchData() {
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

function refreshData() {
    refresh()
    tableRef.value.clearSelection(false)
    emit(EMIT_DETAIL_REFRESH)
}

const printQrConfirmation = ref(false)
const printCertificateConfirmation = ref(false)
// const sendQrConfirmation = ref(false)
// const sendCertificateConfirmation = ref(false)
const bulkDeleteConfirmation = ref(false)
</script>

<template>
    <div class="my-8">
        <UCard>
            <template #header>
                <div class="card-toolbar">
                    <div class="card-toolbar-left-wrapper">
                        <DataTableSearch
                            v-model="search"
                            class="card-toolbar-left w-full"
                            placeholder="Search Participant"
                            @search="searchData"
                            @clear="clearSearch"
                        />
                    </div>

                    <div class="card-toolbar-actions">
                        <PageEventPrintQr
                            v-model:open="printQrConfirmation"
                            :tenant-id="tenantId"
                            :event-id="eventId"
                            :selected-ids="selectedIds"
                            :query="query"
                            :filter-custom-attribute="filterCustomAttribute"
                            :filter-session-status="filterSessionStatus"
                            hide
                            @refresh="refreshData"
                        />
                        <PageEventPrintCertificate
                            v-model:open="printCertificateConfirmation"
                            :tenant-id="tenantId"
                            :event-id="eventId"
                            :selected-ids="selectedIds"
                            :query="query"
                            :filter-custom-attribute="filterCustomAttribute"
                            :filter-session-status="filterSessionStatus"
                            hide
                            @refresh="refreshData"
                        />
                        <!-- <PageEventSendQr -->
                        <!--     v-model:open="sendQrConfirmation" -->
                        <!--     :tenant-id="tenantId" -->
                        <!--     :event-id="eventId" -->
                        <!--     :selected-ids="selectedIds" -->
                        <!--     :query="query" -->
                        <!--     :filter-custom-attribute="filterCustomAttribute" -->
                        <!--     :filter-session-status="filterSessionStatus" -->
                        <!--     hide -->
                        <!--     @refresh="refreshData" -->
                        <!-- /> -->
                        <!-- <PageEventSendCertificate -->
                        <!--     v-model:open="sendCertificateConfirmation" -->
                        <!--     :tenant-id="tenantId" -->
                        <!--     :event-id="eventId" -->
                        <!--     :selected-ids="selectedIds" -->
                        <!--     :query="query" -->
                        <!--     :filter-custom-attribute="filterCustomAttribute" -->
                        <!--     :filter-session-status="filterSessionStatus" -->
                        <!--     hide -->
                        <!--     @refresh="refreshData" -->
                        <!-- /> -->
                        <PageEventBulkDeleteParticipant
                            v-model:open="bulkDeleteConfirmation"
                            :tenant-id="tenantId"
                            :event-id="eventId"
                            :selected-ids="selectedIds"
                            hide
                            @refresh="refreshData"
                        />
                        <PageEventImport
                            :tenant-id="tenantId"
                            :event-id="eventId"
                            @refresh="refreshData"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:plus"
                            class="cursor-pointer"
                            :to="`/events/${eventId}/participant/add`"
                        >
                            Add Attendee
                        </UButton>
                    </div>
                </div>
            </template>

            <PageParticipantTable
                ref="tableRef"
                v-model:limit="limit"
                v-model:page="page"
                v-model:selected="selectedIds"
                v-model:filter-custom-attribute="filterCustomAttribute"
                v-model:filter-session-status="filterSessionStatus"
                :tenant-id="tenantId"
                :event-id="eventId"
                :data="tickets"
                :total="total"
                :pending="pending"
                with-pagination
                @refresh="refreshData"
                @export="exportData"
                @print-qr="printQrConfirmation = true"
                @print-certificate="printCertificateConfirmation = true"
                @bulk-delete="bulkDeleteConfirmation = true"
            />
        </UCard>
    </div>
</template>
