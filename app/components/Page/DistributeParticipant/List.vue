<script setup lang="ts">
interface DistributeParticipant {
    notification_recipient_id: number
    recipient_id: number
    recipient_name: string
    channel: string
    type: number
    reference_type: string
    reference: {
        event_name: string
        reference_id: number
    }
    status: string
    status_updated_at: ISOString
}

defineProps<{
    tenantId: number
}>()

const search = ref('')
const query = ref('')
const page = ref(1)
const limit = ref(5)
const filterDocumentType = ref<string>('')
const filterStatus = ref<string[]>([])
const filterChannel = ref<string[]>([])
const filterSlideover = ref(false)
const activeFilterCount = computed(() => {
    let n = 0

    if (filterDocumentType.value) n++
    if (filterStatus.value.length) n++
    if (filterChannel.value.length) n++

    return n
})

const documentTypes = [
    {
        label: 'All',
        value: '',
    },
    {
        label: 'Invitation',
        value: '1',
    },
    {
        label: 'Certificate',
        value: '2',
    },
    {
        label: 'Invoice',
        value: '3',
    },
]
const statuses = [
    {
        label: 'Pending',
        value: 'pending',
    },
    {
        label: 'Failed',
        value: 'failed',
    },
    {
        label: 'Success',
        value: 'success',
    },
]
const channels = [
    {
        label: 'EMAIL',
        value: 'email',
    },
    {
        label: 'WHATSAPP',
        value: 'whatsapp',
    },
]
const validChannels = computed(() => filterDocumentType.value === '1' || !filterDocumentType.value ? channels : channels.filter(e => e.value === 'email'))
watch(filterDocumentType, (newValue) => {
    if (newValue && newValue !== '1') {
      filterChannel.value = filterChannel.value.filter(e => e === 'email')
    }
})

const list = ref<DistributeParticipant[]>([
    {
        notification_recipient_id: 0,
        recipient_id: 0,
        recipient_name: 'Dummy 1',
        channel: 'EMAIL',
        type: 1,
        reference_type: '',
        reference: {
            event_name: 'Dummy Event',
            reference_id: 0,
        },
        status: 'success',
        status_updated_at: '2026-01-01T00:00:00+07:00',
    },
    {
        notification_recipient_id: 1,
        recipient_id: 1,
        recipient_name: 'Dummy 2',
        channel: 'WHATSAPP',
        type: 2,
        reference_type: '',
        reference: {
            event_name: 'Dummy Event',
            reference_id: 0,
        },
        status: 'pending',
        status_updated_at: '2026-01-01T00:00:00+07:00',
    },
    {
        notification_recipient_id: 2,
        recipient_id: 1,
        recipient_name: 'Dummy 2',
        channel: 'WHATSAPP',
        type: 3,
        reference_type: '',
        reference: {
            event_name: 'Dummy Event',
            reference_id: 0,
        },
        status: 'failed',
        status_updated_at: '2026-01-01T00:00:00+07:00',
    },
])
const total = ref(3)
const pending = ref(false)

function searchData() {
    page.value = 1
    query.value = search.value
    // refresh()
}

function clearSearch() {
    page.value = 1
    search.value = ''
    query.value = ''
    // refresh()
}

function applyFilter() {
    filterSlideover.value = false
    // refresh()
}

function resetFilter() {
    filterDocumentType.value = ''
    filterStatus.value = []
    filterChannel.value = []
    // refresh()
}

const distributeTarget = ref<DistributeParticipant | undefined>()

// REDISTRIBUTION
const redistributeConfirmation = ref(false)

function openRedistributeDialog(data: DistributeParticipant) {
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

function openHistoryDialog(data: DistributeParticipant) {
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
                        >
                            Create Distribution
                        </UButton>
                    </div>
                </div>
            </template>

            <PageDistributeParticipantTable
                v-model:limit="limit"
                v-model:page="page"
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
                    <div class="mb-2"><b>3</b> total distribution attempt for this participant</div>

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
                    <div class="mb-2">Are you sure you want to redistribute notification to {{ distributeTarget ? distributeTarget.recipient_name : '-' }}?</div>

                    <template v-if="distributeTarget">
                        <p class="font-semibold">Detail Notification</p>

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
                        <UCheckboxGroup
                            v-model="filterChannel"
                            indicator="end"
                            variant="card"
                            :items="validChannels"
                            :ui="{ fieldset: 'gap-y-2' }"
                        />
                    </UFormField>

                    <UFormField
                        label="Status"
                    >
                        <UCheckboxGroup
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
