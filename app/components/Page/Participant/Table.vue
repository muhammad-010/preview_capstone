<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

type ToggleAllPageRowsSelected = (value?: boolean | undefined) => void

const { $api } = useNuxtApp()
const props = defineProps<{
    tenantId: number
    eventId: number
    data: TenantEventTicket[]
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })
const selected = defineModel<number[]>('selected', { default: () => [] })
const filterCustomAttribute = defineModel<CustomAttribute[]>('filter-custom-attribute', { default: () => [] })
// const filterCheckedIn = defineModel<boolean | null>('filter-checked-in', { default: null })
const filterSessionStatus = defineModel<TenantEventTicketSessionStatus | null>('filter-session-status', { default: null })
const emit = defineEmits([EMIT_TABLE_REFRESH, EMIT_TABLE_EXPORT, EMIT_TABLE_PRINT_QR, EMIT_TABLE_SEND_QR, EMIT_TABLE_PRINT_CERTIFICATE, EMIT_TABLE_SEND_CERTIFICATE, EMIT_TABLE_BULK_DELETE])
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()

// FILTER CUSTOM ATTRIBUTE
const filterCustomAttributeField = ref(cloneObject(unref(filterCustomAttribute)))
const cleanedFilterCustomAttribute = computed(() => formatCleanCustomAttribute(filterCustomAttribute.value))
const filterCustomAttributeButtonLabel = computed(() => cleanedFilterCustomAttribute.value.map(attr => `${attr.name}: ${attr.value}`).join(', '))
const filterCustomAttributeDialog = ref(false)

function refreshFilterCustomAttributeDialog() {
    filterCustomAttribute.value = cloneObject(unref(filterCustomAttributeField.value))
    triggerRefresh()
}

function clearFilterCustomAttributeDialog(refresh: boolean) {
    for (let index = 0; index < filterCustomAttributeField.value.length; index++) {
        filterCustomAttributeField.value![index]!.value = ''
    }
    if (refresh) refreshFilterCustomAttributeDialog()
}

function closeFilterCustomAttributeDialog(close: () => void) {
    filterCustomAttributeDialog.value = false
    close()
}

function applyFilterCustomAttributeDialog(close: () => void) {
    close()
    refreshFilterCustomAttributeDialog()
}

// FILTER CHECKED-IN
// const filterCheckedInItems = [
//     {
//         label: 'All',
//         value: null,
//     },
//     {
//         label: 'Yes',
//         value: true,
//     },
//     {
//         label: 'No',
//         value: false,
//     },
// ]
// const filterCheckedInField = ref<boolean | null>(null)
// const filterCheckedInLabel = computed(() => filterCheckedInItems.find(e => e.value === filterCheckedIn.value)?.label || 'Invalid Data')
// const filterCheckedInDialog = ref(false)

// function refreshFilterCheckedIn() {
//     filterCheckedIn.value = filterCheckedInField.value
//     emit(EMIT_TABLE_REFRESH)
// }

// function clearFilterCheckedIn(refresh: boolean) {
//     filterCheckedInField.value = null
//     if (refresh) refreshFilterCheckedIn()
// }

// function closeFilterCheckedInDialog(close: () => void) {
//     filterCheckedInDialog.value = false
//     close()
// }

// function applyFilterCheckedInDialog(close: () => void) {
//     close()
//     refreshFilterCheckedIn()
// }

// FILTER SESSION STATUS
const filterSessionStatusItems = [
    {
        label: 'All',
        description: 'No Filter',
        value: null,
    },
    {
        label: formatCapitalize(TICKET_SESSION_STATUS_NONE),
        description: 'Participant that haven\'t checked-in',
        value: TICKET_SESSION_STATUS_NONE,
    },
    {
        label: formatCapitalize(TICKET_SESSION_STATUS_PARTIAL),
        description: 'Participant that already checked-in in some session',
        value: TICKET_SESSION_STATUS_PARTIAL,
    },
    {
        label: formatCapitalize(TICKET_SESSION_STATUS_COMPLETED),
        description: 'Participant that checked-in in all session',
        value: TICKET_SESSION_STATUS_COMPLETED,
    },
]
const filterSessionStatusField = ref<TenantEventTicketSessionStatus | null>(null)
const filterSessionStatusLabel = computed(() => filterSessionStatusItems.find(e => e.value === filterSessionStatus.value)?.label || 'Invalid Data')
const filterSessionStatusDialog = ref(false)

function refreshFilterSessionStatus() {
    filterSessionStatus.value = filterSessionStatusField.value
    triggerRefresh()
}

function clearFilterSessionStatus(refresh: boolean) {
    filterSessionStatusField.value = null
    if (refresh) refreshFilterSessionStatus()
}

function closeFilterSessionStatusDialog(close: () => void) {
    filterSessionStatusDialog.value = false
    close()
}

function applyFilterSessionStatusDialog(close: () => void) {
    close()
    refreshFilterSessionStatus()
}

// ADD FILTER
const filterSelectionDialog = ref(false)
const filterSelections = computed(() => {
    const list = []
    if (!cleanedFilterCustomAttribute.value.length) {
        list.push({
            label: 'Metadata',
            onClick: () => {
                filterSelectionDialog.value = false
                filterCustomAttributeDialog.value = true
            },
        })
    }
    // if (filterCheckedIn.value === null) {
    //     list.push({
    //         label: 'Checked In',
    //         onClick: () => {
    //             filterSelectionDialog.value = false
    //             filterCheckedInDialog.value = true
    //         },
    //     })
    // }
    if (filterSessionStatus.value === null) {
        list.push({
            label: 'Session Status',
            onClick: () => {
                filterSelectionDialog.value = false
                filterSessionStatusDialog.value = true
            },
        })
    }

    return list
})

// DELETION
const deleteConfirmation = ref(false)
const deleteTarget = ref({
    id: 0,
    name: '',
})

function setDeleteTarget(id: number, name: string) {
    deleteTarget.value.id = id
    deleteTarget.value.name = name
}

function openDeleteConfirmation(id: number, name: string) {
    setDeleteTarget(id, name)
    deleteConfirmation.value = true
}

function closeDeleteConfirmation(skipResetPage?: boolean) {
    setDeleteTarget(0, '')
    deleteConfirmation.value = false
    triggerRefresh(skipResetPage)
}

async function deleteData(id: number) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/ticket/${id}`, {
            method: 'DELETE',
        })
        if (data.success) {
            successToast({ description: 'A participant has been deleted' })
            closeDeleteConfirmation()
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to delete participant' })
        closeDeleteConfirmation(true)
    }
}

// CHECK-IN
const manualCheckInTarget = ref<ParticipantCheckInTarget>({
    id: 0,
    sessionId: 0,
    sessionName: '',
    name: '',
    maxAttendance: 0,
    customAttributes: [],
    code: '',
    activity_id: 0,
})
const manualCheckInDialog = ref(false)

function openConfirmManualCheckIn(id: number, name: string, code: string) {
    manualCheckInTarget.value = {
        id,
        sessionId: 0,
        sessionName: '',
        name,
        maxAttendance: 0,
        customAttributes: [],
        code,
        activity_id: 0,
    }
    manualCheckInDialog.value = true
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
    const UProgress = resolveComponent('UProgress')
    const UTooltip = resolveComponent('UTooltip')
    const tableRef = useTemplateRef('tableRef')

    function qrSent(participant: TenantEventTicket) {
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

    function certificateSent(participant: TenantEventTicket) {
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

    const columns = [
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
                const maxAtt = []
                if (row.original.max_attendance)
                    maxAtt.push(h('span', { class: 'text-sm' }, `${row.original.max_attendance} Attendance${row.original.max_attendance > 1 ? 's' : ''}`))

                return h('div', {}, [
                    h('div', { class: 'truncate font-semibold' }, row.original.name),
                    ...maxAtt,
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
            accessorKey: 'custom_attribute',
            header: 'Metadata',
            meta: {
                class: {
                    td: 'max-w-50',
                },
            },
            cell: ({ row }) => {
                return h('div',
                    {},
                    row.original.custom_attribute && row.original.custom_attribute.length
                        ? row.original.custom_attribute
                                .map(attr => h('div', { class: 'truncate' }, [
                                    h('span', { class: 'font-semibold' }, attr.name ? `${attr.name}: ` : ''),
                                    h('span', {}, attr.value),
                                ]))
                        : h('span', {}, '-'),
                )
            },
        },
        {
            accessorKey: 'check_in_progress',
            header: 'Status',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', {}, `${row.original.check_in_progress?.count || 0}/${row.original.check_in_progress?.total || 0} Session`),
                    h(UProgress, {
                        color: row.original.check_in_progress?.total === row.original.check_in_progress?.count ? 'success' : 'info',
                        max: row.original.check_in_progress?.total || 0,
                        modelValue: row.original.check_in_progress?.count || 0,
                    }),
                ])
            },
        },
        {
            accessorKey: 'latest_invitation_log',
            header: 'QR Sent',
            cell: ({ row }) => h('div', { class: 'flex flex-col gap-2' }, qrSent(row.original)),
        },
        {
            accessorKey: 'latest_certificate_log',
            header: 'Certificate Sent',
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
                const checkInComplete = row.original.check_in_progress && row.original.check_in_progress.count === row.original.check_in_progress.total
                const noSession = row.original.check_in_progress && !row.original.check_in_progress.total
                const disabled = row.original.check_in_progress
                    ? checkInComplete || noSession
                    : true
                const checkInTooltip = noSession
                    ? 'Create session on \'Sessions\' tab first'
                    : checkInComplete
                        ? 'Already checked-in on all sessions'
                        : 'Manual Check-In'
                return h('div', { class: 'inline-flex gap-2' }, [
                    h(UTooltip, { text: checkInTooltip, delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'neutral',
                            variant: 'ghost',
                            disabled,
                            icon: 'lucide:circle-check',
                            class: disabled ? 'opacity-25!' : '',
                            onClick: () => openConfirmManualCheckIn(row.original.ticket_id || 0, row.original.name, row.original.code),
                        }),
                    ]),
                    h(UTooltip, { text: 'Edit', delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'neutral',
                            variant: 'ghost',
                            icon: 'lucide:pencil',
                            to: `/events/${props.eventId}/participant/${row.original.ticket_id}/edit`,
                        }),
                    ]),
                    h(UTooltip, { text: 'Delete', delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'error',
                            variant: 'ghost',
                            icon: 'lucide:trash',
                            onClick: () => openDeleteConfirmation(row.original.ticket_id || 0, row.original.name),
                        }),
                    ]),
                ])
            },
        },
    ] as TableColumn<TenantEventTicket>[]

    return { columns, tableRef }
}

const { columns, tableRef } = useColumns()
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-4">
            <div class="flex flex-wrap gap-2">
                <DataTableFilter
                    label="Metadata"
                    :active-condition="Boolean(cleanedFilterCustomAttribute.length)"
                    :active-label="filterCustomAttributeButtonLabel"
                    @open-filter="filterCustomAttributeDialog = true"
                    @clear="() => clearFilterCustomAttributeDialog(true)"
                />

                <!-- <DataTableFilter
                    label="Checked In"
                    :active-condition="filterCheckedIn !== null"
                    :active-label="filterCheckedInLabel"
                    @open-filter="filterCheckedInDialog = true"
                    @clear="() => clearFilterCheckedIn(true)"
                /> -->

                <DataTableFilter
                    label="Session Status"
                    :active-condition="filterSessionStatus !== null"
                    :active-label="filterSessionStatusLabel"
                    @open-filter="filterSessionStatusDialog = true"
                    @clear="() => clearFilterSessionStatus(true)"
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

            <PageParticipantBulkAction
                :selected="someColumnSelected"
                @export="emit(EMIT_TABLE_EXPORT)"
                @print-qr="emit(EMIT_TABLE_PRINT_QR)"
                @send-qr="emit(EMIT_TABLE_SEND_QR)"
                @print-certificate="emit(EMIT_TABLE_PRINT_CERTIFICATE)"
                @send-certificate="emit(EMIT_TABLE_SEND_CERTIFICATE)"
                @bulk-delete="emit(EMIT_TABLE_BULK_DELETE)"
            />
        </div>

        <UTable
            ref="tableRef"
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

        <ModalConfirmNegativeAction
            v-model:open="deleteConfirmation"
            title="Delete Confirmation"
            :body="`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone`"
            @confirm="deleteData(deleteTarget.id)"
        />

        <PageParticipantCheckIn
            v-model:open="manualCheckInDialog"
            v-model:target="manualCheckInTarget"
            :tenant-id="tenantId"
            :event-id="eventId"
            @refresh="() => triggerRefresh(true)"
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

        <UModal v-model:open="filterCustomAttributeDialog">
            <template #header="{ close }">
                <div class="flex justify-between items-center w-full">
                    <h5>Filter Metadata</h5>

                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="lucide:x"
                        @click="() => closeFilterCustomAttributeDialog(close)"
                    />
                </div>
            </template>

            <template #body>
                <UFormField
                    v-for="(item, index) in filterCustomAttributeField"
                    :key="index"
                    :label="item.name"
                    class="mb-4 w-full"
                >
                    <UInput
                        v-model="filterCustomAttributeField![index]!.value"
                        type="string"
                        class="w-full"
                    >
                        <template #trailing>
                            <UButton
                                v-if="filterCustomAttributeField![index]!.value"
                                color="neutral"
                                variant="link"
                                size="sm"
                                icon="lucide:x"
                                @click="filterCustomAttributeField![index]!.value = ''"
                            />
                        </template>
                    </UInput>
                </UFormField>
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
                            @click="() => closeFilterCustomAttributeDialog(close)"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            label="Apply Filter"
                            @click="() => applyFilterCustomAttributeDialog(close)"
                        />
                    </div>
                </div>
            </template>
        </UModal>

        <!-- <UModal v-model:open="filterCheckedInDialog">
            <template #header="{ close }">
                <div class="flex justify-between items-center w-full">
                    <h5>Filter Checked In</h5>

                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="lucide:x"
                        @click="() => closeFilterCheckedInDialog(close)"
                    />
                </div>
            </template>

            <template #body>
                <URadioGroup
                    v-model="filterCheckedInField"
                    variant="table"
                    :items="filterCheckedInItems"
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
                            @click="() => closeFilterCheckedInDialog(close)"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            label="Apply Filter"
                            @click="() => applyFilterCheckedInDialog(close)"
                        />
                    </div>
                </div>
            </template>
        </UModal> -->

        <UModal v-model:open="filterSessionStatusDialog">
            <template #header="{ close }">
                <div class="flex justify-between items-center w-full">
                    <h5>Filter Session Status</h5>

                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="lucide:x"
                        @click="() => closeFilterSessionStatusDialog(close)"
                    />
                </div>
            </template>

            <template #body>
                <URadioGroup
                    v-model="filterSessionStatusField"
                    variant="table"
                    :items="filterSessionStatusItems"
                    value-key="value"
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
                            @click="() => closeFilterSessionStatusDialog(close)"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            label="Apply Filter"
                            @click="() => applyFilterSessionStatusDialog(close)"
                        />
                    </div>
                </div>
            </template>
        </UModal>
    </div>
</template>
