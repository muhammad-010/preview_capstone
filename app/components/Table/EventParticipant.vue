<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

type ToggleAllPageRowsSelected = (value?: boolean | undefined) => void

const { $api } = useNuxtApp()
const props = defineProps<{
    data: Participant[]
    eventId: number
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })
const selected = defineModel<number[]>('selected', { default: () => [] })
const emit = defineEmits([EMIT_TABLE_REFRESH])
const toast = useToast()
const { tenantId } = useUserState()
const rowSelection = ref<Record<string, boolean>>({})
const selectAll = ref(false)
const resetSelectionConfirmation = ref(false)
const deleteConfirmation = ref(false)
const deleteTarget = ref<{ id: number, name: string }>({
    id: 0,
    name: '',
})
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

    selected.value = data
}

/** all is null, so this worked for select all */
function clearSelection(all: boolean) {
    selected.value = []
    selectAll.value = all
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

function setDeleteTarget(id: number, name: string) {
    deleteTarget.value.id = id
    deleteTarget.value.name = name
}

function openDeleteConfirmation(id: number, name: string) {
    setDeleteTarget(id, name)
    deleteConfirmation.value = true
}

function closeDeleteConfirmation() {
    setDeleteTarget(0, '')
    deleteConfirmation.value = false
    emit(EMIT_TABLE_REFRESH)
}

async function deleteData(id: number) {
    try {
        const data = await $api(`/api/tenant/${tenantId.value}/event/${props.eventId}/participant/${id}`, {
            method: 'DELETE',
        })
        if (data.success) {
            toast.add({
                title: 'Success',
                description: 'A participant has been deleted',
                color: 'success',
            })
        }
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to delete participant',
            color: 'error',
        })
        console.error('Delete participant error', error)
    }
    closeDeleteConfirmation()
}

watch(
    () => props.data,
    () => {
        const map: Record<string, boolean> = {}
        props.data.forEach((value, index) => {
            if (selectAll.value || (value.participant_id && selected.value.includes(value.participant_id))) {
                map[index] = true
            }
        })
        rowSelection.value = map
    },
    { immediate: true, deep: true },
)

function useColumns() {
    const UBadge = resolveComponent('UBadge')
    const UButton = resolveComponent('UButton')
    const UCheckbox = resolveComponent('UCheckbox')
    const tableRef = useTemplateRef('tableRef')

    function qrSent(participant: Participant) {
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
                    label: `Email: ${participant.latest_invitation_log.email.status}`,
                }),
            )
        }
        if (participant.latest_invitation_log.whatsapp) {
            qrSent.push(
                h(UBadge, {
                    class: 'w-max',
                    color: INVITATION_STATUS_COLORS[participant.latest_invitation_log.whatsapp.status],
                    variant: 'subtle',
                    label: `Whatsapp: ${participant.latest_invitation_log.whatsapp.status}`,
                }),
            )
        }
        return qrSent
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
                        toggle(row.original.participant_id)
                        row.toggleSelected(!!value)
                    },
                    'aria-label': 'Select row',
                }),
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', { class: 'font-semibold' }, row.original.name),
                ])
            },
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', {}, row.original.email || ''),
                ])
            },
        },
        {
            accessorKey: 'max_attendance',
            header: 'Max Attendance',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', {}, row.original.max_attendance || '-'),
                ])
            },
        },
        {
            accessorKey: 'custom_attribute',
            header: 'Metadata',
            cell: ({ row }) => {
                return h('div',
                    {},
                    row.original.custom_attribute && row.original.custom_attribute.length
                        ? row.original.custom_attribute
                                .map(attr => h('div', {}, [
                                    h('span', { class: 'font-semibold' }, attr.name ? `${attr.name}: ` : ''),
                                    h('span', {}, attr.value),
                                ]))
                        : h('span', {}, '-'),
                )
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                return h(UBadge, {
                    color: PARTICIPANT_STATUS_COLORS[row.getValue('status') as ParticipantStatus],
                    variant: 'subtle',
                    label: row.original.status,
                })
            },
        },
        {
            accessorKey: 'latest_invitation_log',
            header: 'QR Sent',
            cell: ({ row }) => h('div', { class: 'flex flex-col gap-2' }, qrSent(row.original)),
        },
        {
            accessorKey: 'participant_id',
            header: 'Action',
            cell: ({ row }) => {
                return h('div', { class: 'flex gap-2' }, [
                    h(UButton, {
                        color: 'neutral',
                        variant: 'ghost',
                        icon: 'lucide:pencil',
                        to: `/events/${props.eventId}/participant/${row.original.participant_id}/edit`,
                    }),
                    h(UButton, {
                        color: 'error',
                        variant: 'ghost',
                        icon: 'lucide:trash',
                        onClick: () => openDeleteConfirmation(row.original.participant_id || 0, row.original.name),
                    }),
                ])
            },
        },
    ] as TableColumn<Participant>[]

    return { columns, tableRef }
}

const { columns, tableRef } = useColumns()
</script>

<template>
    <div>
        <UTable
            ref="tableRef"
            v-model:row-selection="rowSelection"
            :data="data"
            :columns="columns"
            :loading="pending"
        />

        <MiscPagination
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
    </div>
</template>
