<script setup lang="ts">
defineProps<{
    tenantId: number
}>()

const search = ref('')
const query = ref('')
const page = ref(1)
const limit = ref(5)
const selectedIds = ref<number[]>([])
const filterDocumentType = ref<string[]>([])
const filterStatus = ref<string[]>([])

const list = ref([
    {
        ticket_id: 1,
        code: '',
        name: 'Dummy',
        email: 'dummy@mail.com',
        phone_number: '080880808800',
        event_name: 'Dummy Event',
        latest_invitation_log: {
            email: {
                status: 'queue' as InvitationStatus,
            },
            whatsapp: {
                status: 'failed' as InvitationStatus,
            },
        },

        latest_certificate_log: {
            email: {
                status: 'success' as InvitationStatus,
            },
        },
    },
    {
        ticket_id: 2,
        code: '',
        name: 'Dummy 2',
        email: 'dummy@mail.com',
        phone_number: '080880808800',
        event_name: 'Dummy Event',
        latest_invitation_log: {
            email: {
                status: 'queue' as InvitationStatus,
            },
            whatsapp: {
                status: 'failed' as InvitationStatus,
            },
        },

        latest_certificate_log: {
            email: {
                status: 'success' as InvitationStatus,
            },
        },
    },
])
const total = ref(2)
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

// DISTRIBUTION
const distributeDocumentTypeItems = [
    {
        label: 'QR Invitation',
        value: 'qr-invitation',
    },
    {
        label: 'Certificate',
        value: 'certificate',
    },
]
const distributeDocumentType = ref('qr-invitation')

const distributeMethodItems = [
    {
        label: 'Email',
        value: 'email',
    },
    {
        label: 'Whatsapp',
        value: 'whatsapp',
    },
]
const validDistributeMethodItems = computed(() => {
    if (distributeDocumentType.value === 'certificate') {
        return distributeMethodItems.filter(e => e.value === 'email')
    }
    return distributeMethodItems
})
const distributeMethod = ref([])

watch(distributeDocumentType, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        distributeMethod.value = []
    }
})

const distributeConfirmation = ref(false)
const distributeTarget = ref('')

function closeDistributeDialog(close: () => void) {
    selectedIds.value = []
    distributeTarget.value = ''
    distributeDocumentType.value = 'qr-invitation'
    close()
}

function applyDistributeDialog(close: () => void) {
    selectedIds.value = []
    distributeTarget.value = ''
    distributeDocumentType.value = 'qr-invitation'
    close()
}

// HISTORION
const historyDialog = ref(false)
const filterHistoryItems = [
    {
        label: 'QR - Email',
        value: 'qr-email',
    },
    {
        label: 'QR - Whatsapp',
        value: 'qr-whatsapp',
    },
    {
        label: 'Certificate - Email',
        value: 'certificate-email',
    },
]
const filterHistory = ref([])

function openHistoryDialog(id: number) {
    console.log(id)
    historyDialog.value = true
}

function closeHistoryDialog(close: () => void) {
    distributeTarget.value = ''
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
                    <UButton
                        color="primary"
                        icon="lucide:plus"
                        class="cursor-pointer"
                    >
                        Create Distribution
                    </UButton>
                </div>
            </template>

            <PageDistributeParticipantTable
                v-model:limit="limit"
                v-model:page="page"
                v-model:selected="selectedIds"
                v-model:filter-document-type="filterDocumentType"
                v-model:filter-status="filterStatus"
                v-model:distribute-target="distributeTarget"
                :tenant-id="tenantId"
                :data="list"
                :total="total"
                :pending="pending"
                with-pagination
                @distribute="distributeConfirmation = true"
                @open-distribute-history="openHistoryDialog"
            />
        </UCard>

        <UModal v-model:open="distributeConfirmation">
            <template #header="{ close }">
                <div class="flex justify-between items-center w-full">
                    <h5>Distribute to {{ selectedIds.length > 1 ? `${selectedIds.length} Participants` : distributeTarget }}</h5>

                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="lucide:x"
                        @click="() => closeDistributeDialog(close)"
                    />
                </div>
            </template>

            <template #body>
                <div class="flex flex-col gap-4">
                    <UFormField
                        label="Document Type"
                    >
                        <URadioGroup
                            v-model="distributeDocumentType"
                            variant="card"
                            :items="distributeDocumentTypeItems"
                            value-key="value"
                            label-key="label"
                        />
                    </UFormField>

                    <UFormField
                        label="Distribute Method"
                    >
                        <UCheckboxGroup
                            v-model="distributeMethod"
                            variant="card"
                            :items="validDistributeMethodItems"
                            value-key="value"
                            label-key="label"
                        />
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
                            @click="() => closeDistributeDialog(close)"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            label="Apply Filter"
                            @click="() => applyDistributeDialog(close)"
                        />
                    </div>
                </div>
            </template>
        </UModal>

        <UModal v-model:open="historyDialog">
            <template #header="{ close }">
                <div class="flex justify-between items-center w-full">
                    <div>
                        <h5>Distribution History</h5>
                        <span class="text-toned">{{ distributeTarget }}</span>
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
                <div class="flex flex-col gap-4">
                    <span><b>3</b> total distribution attempt for this participant</span>

                    <UCheckboxGroup
                        v-model="filterHistory"
                        variant="card"
                        orientation="horizontal"
                        :items="filterHistoryItems"
                        value-key="value"
                        label-key="label"
                    />

                    <div class="border-b border-default" />

                    <div class="py-2 flex items-center justify-between">
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
    </div>
</template>
