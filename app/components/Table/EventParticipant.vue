<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const props = defineProps<{
    data: Participant[]
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })
const selected = defineModel<number[]>('selected', { default: () => [] })
const rowSelection = ref({})

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

function toggleAll(all: boolean) {
    if (!all) {
        selected.value = []
        return
    }

    const data: number[] = []
    for (const participant of props.data) {
        if (participant.participant_id) {
            data.push(participant.participant_id)
        }
    }
    selected.value = data
}

function useColumns() {
    const UBadge = resolveComponent('UBadge')
    const UButton = resolveComponent('UButton')
    const UCheckbox = resolveComponent('UCheckbox')
    const tableRef = useTemplateRef('tableRef')
    const columns = [
        {
            id: 'select',
            header: ({ table }) =>
                h(UCheckbox, {
                    'modelValue': table.getIsSomePageRowsSelected()
                        ? 'indeterminate'
                        : table.getIsAllPageRowsSelected(),
                    'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
                        toggleAll(!!value)
                        table.toggleAllPageRowsSelected(!!value)
                    },
                    'aria-label': 'Select all',
                }),
            cell: ({ row }) =>
                h(UCheckbox, {
                    'modelValue': row.getIsSelected(),
                    'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
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
            accessorKey: 'participant_id',
            header: 'Action',
            cell: ({ row }) => {
                return h('div', { class: 'flex gap-2' }, [
                    h(UButton, {
                        color: 'neutral',
                        variant: 'ghost',
                        icon: 'lucide:pencil',
                        to: `events/${row.original.participant_id}/edit`,
                    }),
                    h(UButton, {
                        color: 'neutral',
                        variant: 'ghost',
                        icon: 'lucide:info',
                        to: `events/${row.original.participant_id}`,
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
    </div>
</template>
