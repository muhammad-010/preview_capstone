<script setup lang="ts">
const props = defineProps<{
    tenantId: number
}>()

const search = ref('')
const query = ref('')
const page = ref(1)
const limit = ref(5)
const filterReferenceType = ref<DistributeRefType>('events')
const filterDocumentType = ref<DistributeType | undefined>()
const filterStatus = ref<string>('')
const filterChannel = ref<DistributeChannel | undefined>()
const filterSlideover = ref(false)
const activeFilterCount = computed(() => {
    let n = 0

    if (filterDocumentType.value) n++
    if (filterChannel.value) n++
    if (filterStatus.value) n++

    return n
})

const documentTypes = computed(() => [
    ...Object.entries(DISTRIBUTE_TYPE_ENUM).map(([key, value]) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        value: String(value),
    })),
])
const statuses = computed(() => [
    ...Object.entries(DISTRIBUTE_STATUS_ENUM).map(([key, value]) => ({
        label: formatCapitalize(key),
        value: String(value),
    }))
])
const channels = computed(() => {
    if (!filterDocumentType.value || filterDocumentType.value === String(DISTRIBUTE_TYPE_ENUM[DISTRIBUTE_TYPE_INVITATION])) {
        return DISTRIBUTE_CHANNEL_DROPDOWN.map(e => ({
            label: e.toUpperCase(),
            value: e,
        }))
    }
    else {
        return DISTRIBUTE_CHANNEL_DROPDOWN.filter(e => e === DISTRIBUTE_CHANNEL_EMAIL).map(e => ({
            label: e.toUpperCase(),
            value: e,
        }))
    }
})
watch(filterDocumentType, (newValue) => {
    if (newValue) {
        filterChannel.value = undefined
    }
})

const { data, pending, refresh } = await useApi(`/api/tenant/${props.tenantId}/distribute`, {
    transform: res => res.data,
    query: computed(() => {
        return {
            query: query.value,
            page: page.value,
            limit: limit.value,
            reference_type: filterReferenceType.value,
            ...(filterChannel.value ? { channel: filterChannel.value } : {}),
            ...(filterDocumentType.value ? { type: filterDocumentType.value } : {}),
            ...(filterStatus.value ? { status: filterStatus.value } : {}),
        }
    }),
    watch: false,
})

const list = computed<Distribute[]>(() => data.value?.recipients ?? [])
const total = computed(() => data.value?.total_data ?? 0)
watch(page, () => refresh())
watch(limit, () => refresh())

function searchData() {
    page.value = 1
    query.value = search.value
    refresh()
}

function clearSearch() {
    page.value = 1
    search.value = ''
    query.value = ''
    refresh()
}

function applyFilter() {
    filterSlideover.value = false

    if (filterDocumentType.value === String(DISTRIBUTE_TYPE_ENUM[DISTRIBUTE_TYPE_INVOICE])) {
        filterReferenceType.value = DISTRIBUTE_REF_TYPE_ORDERS
    }
    else {
        filterReferenceType.value = DISTRIBUTE_REF_TYPE_EVENTS
    }

    refresh()
}

function resetFilter() {
    filterDocumentType.value = undefined
    filterStatus.value = ''
    filterChannel.value = undefined
    refresh()
}

const distributeTarget = ref<Distribute | undefined>()

// REDISTRIBUTION
const redistributeConfirmation = ref(false)

function openRedistributeDialog(data: Distribute) {
    distributeTarget.value = data
    redistributeConfirmation.value = true
}

function confirmRedistributeDialog() {
    distributeTarget.value = undefined
}

function closeRedistributeDialog() {
    distributeTarget.value = undefined
    redistributeConfirmation.value = false
}

// HISTORION
const historyDialog = ref(false)

function openHistoryDialog(data: Distribute) {
    distributeTarget.value = data
    historyDialog.value = true
}

function closeHistoryDialog(close: () => void) {
    distributeTarget.value = undefined
    close()
}
</script>

<template>
    <div class="mt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-8">
            <CardTotal
                title="Total Participant"
                :total="7"
                icon="lucide:users"
                icon-color="info"
            />

            <CardTotal
                title="Fully Distributed"
                :total="2"
                icon="lucide:circle-check"
                icon-color="success"
            />

            <CardTotal
                title="Pending Items"
                :total="4"
                icon="lucide:clock-alert"
                icon-color="warning"
            />

            <CardTotal
                title="Failed Items"
                :total="1"
                icon="lucide:triangle-alert"
                icon-color="error"
            />
        </div>

        <UCard>
            <template #header>
                <div class="card-toolbar">
                    <DataTableSearch
                        v-model="search"
                        class="card-toolbar-left"
                        @search="searchData"
                        @clear="clearSearch"
                    />

                    <div class="card-toolbar-actions">
                        <UButton
                            :label="`Advanced Filter${activeFilterCount ? ` (${activeFilterCount})` : ''}`"
                            icon="lucide:filter"
                            color="neutral"
                            variant="subtle"
                            @click="filterSlideover = true"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:plus"
                            class="cursor-pointer"
                            to="/distribute/add"
                        >
                            Create Distribution
                        </UButton>
                    </div>
                </div>
            </template>

            <PageDistributeParticipantTable
                v-model:limit="limit"
                v-model:page="page"
                v-model:reference-type="filterReferenceType"
                :tenant-id="tenantId"
                :data="list"
                :total="total"
                :pending="pending"
                with-pagination
                @distribute="openRedistributeDialog"
                @open-distribute-history="openHistoryDialog"
            />
        </UCard>

        <UModal v-model:open="historyDialog">
            <template #header="{ close }">
                <div class="flex justify-between items-center w-full">
                    <div>
                        <h5>Distribution History</h5>
                        <span class="text-toned">{{ distributeTarget ? distributeTarget.recipient_name : '-' }}</span>
                    </div>

                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="lucide:x"
                        @click="() => closeHistoryDialog(close)"
                    />
                </div>
            </template>

            <template #body>
                <div class="flex flex-col gap-2">
                    <div class="mb-2">
                        <b>3</b> total distribution attempt for this participant
                    </div>

                    <div class="py-2 px-4 flex items-center justify-between rounded-lg bg-primary-50 dark:bg-primary-950 not-last:mb-2">
                        <div class="flex items-center gap-4">
                            <UAvatar
                                icon="lucide:mail"
                                size="lg"
                                color="info"
                            />

                            <div>
                                <p class="text-sm font-semibold">
                                    QR Invitation - Email
                                </p>
                                <span class="text-xs text-toned">21 Jul 2026 at 09:12</span>
                            </div>
                        </div>

                        <UBadge
                            color="success"
                            variant="subtle"
                            size="sm"
                            label="Sent"
                        />
                    </div>
                </div>
            </template>
        </UModal>

        <ModalConfirmPositiveAction
            v-model:open="redistributeConfirmation"
            title="Redistribute Notification"
            confirm-label="Yes, Resend Notification"
            @confirm="confirmRedistributeDialog"
            @cancel="closeRedistributeDialog"
        >
            <template #body>
                <div class="flex flex-col gap-4">
                    <div class="mb-2">
                        Are you sure you want to redistribute notification to {{ distributeTarget ? distributeTarget.recipient_name : '-' }}?
                    </div>

                    <template v-if="distributeTarget">
                        <p class="font-semibold">
                            Detail Notification
                        </p>

                        <div class="flex items center justify-between text-sm">
                            <span>Recipient Name</span>
                            <span class="font-semibold">{{ distributeTarget.recipient_name }}</span>
                        </div>

                        <div class="flex items center justify-between text-sm">
                            <span>Event Name</span>
                            <span class="font-semibold">{{ distributeTarget.reference.event_name }}</span>
                        </div>

                        <div class="flex items center justify-between text-sm">
                            <span>Channel</span>
                            <span class="font-semibold">{{ distributeTarget.channel }}</span>
                        </div>

                        <div class="flex items center justify-between text-sm">
                            <span>Document Type</span>
                            <span class="font-semibold">{{ distributeTarget.type }}</span>
                        </div>
                    </template>
                </div>
            </template>
        </ModalConfirmPositiveAction>

        <USlideover
            v-model:open="filterSlideover"
            title="Advanced Filter"
            :ui="{ content: 'max-w-xl' }"
        >
            <template #body>
                <div class="flex flex-col gap-6">
                    <UFormField
                        label="Document Type"
                    >
                        <URadioGroup
                            v-model="filterDocumentType"
                            indicator="end"
                            variant="card"
                            :items="documentTypes"
                            :ui="{ fieldset: 'gap-y-2' }"
                        />
                    </UFormField>

                    <UFormField
                        label="Channel"
                    >
                        <URadioGroup
                            v-model="filterChannel"
                            indicator="end"
                            variant="card"
                            :items="channels"
                            :ui="{ fieldset: 'gap-y-2' }"
                        />
                    </UFormField>

                    <UFormField
                        label="Status"
                    >
                        <URadioGroup
                            v-model="filterStatus"
                            indicator="end"
                            variant="card"
                            :items="statuses"
                            :ui="{ fieldset: 'gap-y-2' }"
                        />
                    </UFormField>
                </div>
            </template>

            <template #footer>
                <div class="flex items-center justify-center w-full gap-4">
                    <UButton
                        color="neutral"
                        variant="soft"
                        label="Reset Filter"
                        class="text-lg font-semibold py-3 w-full"
                        @click="resetFilter()"
                    />
                    <UButton
                        label="Apply Filter"
                        class="text-lg font-semibold py-3 w-full"
                        @click="applyFilter()"
                    />
                </div>
            </template>
        </USlideover>
    </div>
</template>
