<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
    customAttributes: CustomAttribute[]
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])

const { $api } = useNuxtApp()
const toast = useToast()
const search = ref('')
const query = ref('')
const page = ref(1)
const limit = ref(5)
const selectedIds = ref<number[]>([])
const filterCustomAttribute = ref<CustomAttribute[]>(structuredClone(toRaw(unref(props.customAttributes))))
// const filterCheckedIn = ref<boolean | null>(null)
const filterSessionStatus = ref<ParticipantSessionStatus | null>(null)

const { data, pending, refresh } = useApi(`/api/tenant/${props.tenantId}/event/${props.eventId}/participant`, {
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
defineExpose({ refresh })

const participants = computed<Participant[]>(() => data.value?.participant ?? [])
const total = computed(() => data.value?.total_data ?? 0)
watch(page, () => refresh())
watch(limit, () => refresh())

async function exportData() {
    try {
        const { data } = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/participant/export`, {
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
    emit(EMIT_DETAIL_REFRESH)
}

const printConfirmation = ref(false)
const sendConfirmation = ref(false)
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
                            v-model:open="printConfirmation"
                            :tenant-id="tenantId"
                            :event-id="eventId"
                            :selected-ids="selectedIds"
                            hide
                            @refresh="refreshData"
                        />
                        <PageEventSendQr
                            v-model:open="sendConfirmation"
                            :tenant-id="tenantId"
                            :event-id="eventId"
                            :selected-ids="selectedIds"
                            hide
                            @refresh="refreshData"
                        />
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
                v-model:limit="limit"
                v-model:page="page"
                v-model:selected="selectedIds"
                v-model:filter-custom-attribute="filterCustomAttribute"
                v-model:filter-session-status="filterSessionStatus"
                :tenant-id="tenantId"
                :event-id="eventId"
                :data="participants"
                :total="total"
                :pending="pending"
                with-pagination
                @refresh="refreshData"
                @export="exportData"
                @print-qr="printConfirmation = true"
                @send-qr="sendConfirmation = true"
                @bulk-delete="bulkDeleteConfirmation = true"
            />
        </UCard>
    </div>
</template>
