<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

interface DistributeParticipant {
    ticket_id: number
    code: string
    name: string
    email: string
    phone_number: string
    event_name: string
    latest_invitation_log?: TenantEventTicketInvitationLog | null
    latest_certificate_log?: TenantEventTicketInvitationLog | null
}

type ToggleAllPageRowsSelected = (value?: boolean | undefined) => void

const props = defineProps<{
    tenantId: number
    data: DistributeParticipant[]
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })
const selected = defineModel<number[]>('selected', { default: () => [] })
const distributeTarget = defineModel<string>('distribute-target', { default: '' })
const filterDocumentType = defineModel<string[]>('filter-document-type', { default: () => [] })
const filterStatus = defineModel<string[]>('filter-status', { default: () => [] })
const emit = defineEmits([EMIT_TABLE_REFRESH, EMIT_TABLE_DISTRIBUTE, EMIT_OPEN_DISTRIBUTE_HISTORY])

/*
const { $api } = useNuxtApp()
const { errorToast } = useErrorToast()
*/

// FILTER DOCUMENT TYPE
const filterDocumentTypeItems = [
    {
        label: 'QR Invitation',
        value: 'qr-invitation',
    },
    {
        label: 'Certificate',
        value: 'certificate',
    },
]
const filterDocumentTypeField = ref(cloneObject(unref(filterDocumentType)))
const filterDocumentTypeLabel = computed(() => filterDocumentTypeItems.filter(e => filterDocumentTypeField.value.includes(e.value)).map(e => e.label).join(', '))
const filterDocumentTypeDialog = ref(false)

function refreshFilterDocumentType() {
    filterDocumentType.value = filterDocumentTypeField.value
    triggerRefresh()
}

function clearFilterDocumentType(refresh: boolean) {
    filterDocumentTypeField.value = []
    if (refresh) refreshFilterDocumentType()
}

function closeFilterDocumentTypeDialog(close: () => void) {
    filterDocumentTypeDialog.value = false
    close()
}

function applyFilterDocumentTypeDialog(close: () => void) {
    close()
    refreshFilterDocumentType()
}

// FILTER STATUS
const filterStatusItems = [
    {
        label: 'Success',
        value: 'success',
    },
    {
        label: 'Queue',
        value: 'queue',
    },
    {
        label: 'Failed',
        value: 'failed',
    },
]
const filterStatusField = ref(cloneObject(unref(filterStatus)))
const filterStatusLabel = computed(() => filterStatusItems.filter(e => filterStatusField.value.includes(e.value)).map(e => e.label).join(', '))
const filterStatusDialog = ref(false)

function refreshFilterStatus() {
    filterStatus.value = filterStatusField.value
    triggerRefresh()
}

function clearFilterStatus(refresh: boolean) {
    filterStatusField.value = []
    if (refresh) refreshFilterStatus()
}

function closeFilterStatusDialog(close: () => void) {
    filterStatusDialog.value = false
    close()
}

function applyFilterStatusDialog(close: () => void) {
    close()
    refreshFilterStatus()
}

// ADD FILTER
const filterSelectionDialog = ref(false)
const filterSelections = computed(() => {
    const list = []
    if (!filterDocumentType.value.length) {
        list.push({
            label: 'Document Type',
            onClick: () => {
                filterSelectionDialog.value = false
                filterDocumentTypeDialog.value = true
            },
        })
    }
    if (!filterStatus.value.length) {
        list.push({
            label: 'Status',
            onClick: () => {
                filterSelectionDialog.value = false
                filterStatusDialog.value = true
            },
        })
    }

    return list
})

// HISTORION
function openHistoryDialog(name: string, id: number) {
    distributeTarget.value = name
    emit(EMIT_OPEN_DISTRIBUTE_HISTORY, id)
}

// DISTRIBUTION
function openDistributeConfirmation(name: string, id?: number) {
    if (id) selected.value.push(id)
    distributeTarget.value = name
    emit(EMIT_TABLE_DISTRIBUTE)
}

// TABLE
const rowSelection = ref<Record<string, boolean>>({})
const selectAll = ref(false)
const someColumnSelected = ref(false)
const resetSelectionConfirmation = ref(false)
const resetFunction = ref<ToggleAllPageRowsSelected>()

function toggle(pId: number | undefined) {
    if (!pId) return

    const data = selected.value
    const i = data.indexOf(pId)

    if (i !== -1) {
        data.splice(i, 1)
    }
    else {
        data.push(pId)
    }

    someColumnSelected.value = data.length > 0
    selected.value = data
}

/** all is null, so this worked for select all */
function clearSelection(all: boolean) {
    selected.value = []
    selectAll.value = all
    someColumnSelected.value = all
}

function askResetSelection(cb: ToggleAllPageRowsSelected) {
    resetFunction.value = cb
    resetSelectionConfirmation.value = true
}

function confirmResetSelection() {
    const cb = resetFunction.value
    if (cb) cb(false)
    clearSelection(false)
    resetFunction.value = undefined
    resetSelectionConfirmation.value = false
}

watch(
    () => props.data,
    () => {
        const map: Record<string, boolean> = {}
        props.data.forEach((value, index) => {
            if (selectAll.value || (value.ticket_id && selected.value.includes(value.ticket_id))) {
                map[index] = true
            }
        })
        rowSelection.value = map
    },
    { immediate: true, deep: true },
)
watch(
  [selected, someColumnSelected],
  ([newSelected], [_, oldSomeColumnSelected]) => {
    if (newSelected.length === 0 && oldSomeColumnSelected) {
        selectAll.value = false
        someColumnSelected.value = false
        rowSelection.value = {}
    }
  }
)

function triggerRefresh(skipResetPage?: boolean) {
    if (!skipResetPage) {
        page.value = 1
    }
    clearSelection(false)
    emit(EMIT_TABLE_REFRESH)
}

defineExpose({ clearSelection })

function useColumns() {
    const UBadge = resolveComponent('UBadge')
    const UButton = resolveComponent('UButton')
    const UCheckbox = resolveComponent('UCheckbox')
    const UTooltip = resolveComponent('UTooltip')

    function qrSent(participant: DistributeParticipant) {
        if (!participant.latest_invitation_log) {
            return h('span', { class: 'text-dimmed' }, 'Not Sent')
        }

        const qrSent = []
        if (participant.latest_invitation_log.email) {
            qrSent.push(
                h(UBadge, {
                    class: 'w-max',
                    color: INVITATION_STATUS_COLORS[participant.latest_invitation_log.email.status],
                    variant: 'subtle',
                    label: `Email: ${formatCapitalize(participant.latest_invitation_log.email.status)}`,
                }),
            )
        }
        if (participant.latest_invitation_log.whatsapp) {
            qrSent.push(
                h(UBadge, {
                    class: 'w-max',
                    color: INVITATION_STATUS_COLORS[participant.latest_invitation_log.whatsapp.status],
                    variant: 'subtle',
                    label: `Whatsapp: ${formatCapitalize(participant.latest_invitation_log.whatsapp.status)}`,
                }),
            )
        }
        return qrSent
    }

    function certificateSent(participant: DistributeParticipant) {
        if (!participant.latest_certificate_log) {
            return h('span', { class: 'text-dimmed' }, 'Not Sent')
        }

        const certificateSent = []
        if (participant.latest_certificate_log.email) {
            certificateSent.push(
                h(UBadge, {
                    class: 'w-max',
                    color: INVITATION_STATUS_COLORS[participant.latest_certificate_log.email.status],
                    variant: 'subtle',
                    label: `Email: ${formatCapitalize(participant.latest_certificate_log.email.status)}`,
                }),
            )
        }
        return certificateSent
    }

    return [
        {
            id: 'select',
            header: ({ table }) =>
                h(UCheckbox, {
                    'modelValue': table.getIsSomePageRowsSelected()
                        ? 'indeterminate'
                        : table.getIsAllPageRowsSelected(),
                    'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
                        clearSelection(!!value)
                        table.toggleAllPageRowsSelected(!!value)
                    },
                    'aria-label': 'Select all',
                }),
            cell: ({ table, row }) =>
                h(UCheckbox, {
                    'modelValue': row.getIsSelected(),
                    'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
                        if (table.getIsAllPageRowsSelected()) {
                            askResetSelection(table.toggleAllPageRowsSelected)
                            return
                        }
                        toggle(row.original.ticket_id)
                        row.toggleSelected(!!value)
                    },
                    'aria-label': 'Select row',
                }),
        },
        {
            accessorKey: 'name',
            header: 'Name',
            meta: {
                class: {
                    td: `max-w-50`,
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate font-semibold' }, row.original.name),
                ])
            },
        },
        {
            accessorKey: 'email',
            header: 'Contact',
            meta: {
                class: {
                    td: 'max-w-50',
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate' }, row.original.email || ''),
                    h('div', { class: 'truncate' }, row.original.phone_number || ''),
                ])
            },
        },
        {
            accessorKey: 'event_name',
            header: 'Event',
            meta: {
                class: {
                    td: 'max-w-50',
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate' }, row.original.event_name || ''),
                ])
            },
        },
        {
            accessorKey: 'latest_invitation_log',
            header: 'QR Invitation',
            cell: ({ row }) => h('div', { class: 'flex flex-col gap-2' }, qrSent(row.original)),
        },
        {
            accessorKey: 'latest_certificate_log',
            header: 'Certificate',
            cell: ({ row }) => h('div', { class: 'flex flex-col gap-2' }, certificateSent(row.original)),
        },
        {
            accessorKey: 'ticket_id',
            header: 'Action',
            meta: {
                class: {
                    td: 'w-[1%]',
                },
            },
            cell: ({ row }) => {
                return h('div', { class: 'inline-flex gap-2' }, [
                    h(UTooltip, { text: 'History', delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'neutral',
                            variant: 'ghost',
                            icon: 'lucide:file-clock',
                            onClick: () => openHistoryDialog(row.original.name, row.original.ticket_id ?? 0),
                        }),
                    ]),
                    h(UTooltip, { text: 'Distribute', delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'neutral',
                            variant: 'ghost',
                            icon: 'lucide:send',
                            onClick: () => openDistributeConfirmation(row.original.name, row.original.ticket_id),
                        }),
                    ]),
                ])
            },
        },
    ] as TableColumn<DistributeParticipant>[]
}

const columns = useColumns()
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-4">
            <div class="flex flex-wrap gap-2">
                <DataTableFilter
                    label="Document Type"
                    :active-condition="filterDocumentType.length > 0"
                    :active-label="filterDocumentTypeLabel"
                    @open-filter="filterDocumentTypeDialog = true"
                    @clear="() => clearFilterDocumentType(true)"
                />

                <DataTableFilter
                    label="Status"
                    :active-condition="filterStatus.length > 0"
                    :active-label="filterStatusLabel"
                    @open-filter="filterStatusDialog = true"
                    @clear="() => clearFilterStatus(true)"
                />

                <UButton
                    v-if="filterSelections.length"
                    color="neutral"
                    variant="subtle"
                    size="xs"
                    icon="lucide:plus"
                    label="Add Filter"
                    @click="filterSelectionDialog = true"
                />
            </div>

            <PageDistributeParticipantBulkAction
                :selected="someColumnSelected"
                @distribute="() => openDistributeConfirmation('Selected')"
            />
        </div>
        <UTable
            v-model:row-selection="rowSelection"
            :data="data"
            :columns="columns"
            :loading="pending"
        />

        <DataTablePagination
            v-if="withPagination"
            v-model:limit="limit"
            v-model:page="page"
            :total="total"
        />

        <ModalConfirmNegativeAction
            v-model:open="resetSelectionConfirmation"
            title="Reset Selection"
            body="Are you sure you want to reset selection?"
            confirm-label="Yes, Reset Selection"
            @confirm="confirmResetSelection"
        />

        <UModal v-model:open="filterSelectionDialog">
            <template #header="{ close }">
                <div class="flex justify-between items-center w-full">
                    <h5>Add Filter</h5>

                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="lucide:x"
                        @click="close"
                    />
                </div>
            </template>

            <template #body>
                <div class="flex flex-col gap-4">
                    <UButton
                        v-for="(filter, index) in filterSelections"
                        :key="index"
                        :label="filter.label"
                        variant="outline"
                        color="neutral"
                        size="xl"
                        @click="() => filter.onClick()"
                    />
                </div>
            </template>
        </UModal>

        <UModal v-model:open="filterDocumentTypeDialog">
            <template #header="{ close }">
                <div class="flex justify-between items-center w-full">
                    <h5>Filter Document Type</h5>

                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="lucide:x"
                        @click="() => closeFilterDocumentTypeDialog(close)"
                    />
                </div>
            </template>

            <template #body>
                <UCheckboxGroup
                    v-model="filterDocumentTypeField"
                    variant="card"
                    :items="filterDocumentTypeItems"
                    value-key="value"
                    label-key="label"
                />
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
                            @click="() => closeFilterDocumentTypeDialog(close)"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            label="Apply Filter"
                            @click="() => applyFilterDocumentTypeDialog(close)"
                        />
                    </div>
                </div>
            </template>
        </UModal>

        <UModal v-model:open="filterStatusDialog">
            <template #header="{ close }">
                <div class="flex justify-between items-center w-full">
                    <h5>Filter Status</h5>

                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="lucide:x"
                        @click="() => closeFilterStatusDialog(close)"
                    />
                </div>
            </template>

            <template #body>
                <UCheckboxGroup
                    v-model="filterStatusField"
                    variant="card"
                    :items="filterStatusItems"
                    value-key="value"
                    label-key="label"
                />
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
                            @click="() => closeFilterStatusDialog(close)"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            label="Apply Filter"
                            @click="() => applyFilterStatusDialog(close)"
                        />
                    </div>
                </div>
            </template>
        </UModal>
    </div>
</template>
