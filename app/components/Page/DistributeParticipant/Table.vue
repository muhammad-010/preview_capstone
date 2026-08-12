<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

defineProps<{
    tenantId: number
    data: Distribute[]
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })
const referenceType = defineModel<string>('reference-type', { default: 'events' })
const emit = defineEmits([EMIT_TABLE_REFRESH, EMIT_TABLE_DISTRIBUTE, EMIT_OPEN_DISTRIBUTE_HISTORY])

// HISTORION
function openHistoryDialog(data: Distribute) {
    emit(EMIT_OPEN_DISTRIBUTE_HISTORY, data)
}

// DISTRIBUTION
function openDistributeConfirmation(data: Distribute) {
    emit(EMIT_TABLE_DISTRIBUTE, data)
}

const columns = computed(() => {
    const UBadge = resolveComponent('UBadge')
    const UButton = resolveComponent('UButton')
    const UTooltip = resolveComponent('UTooltip')

    const columns: TableColumn<Distribute>[] = [
        {
            accessorKey: 'type',
            header: 'Document Type',
            meta: {
                class: {
                    td: `max-w-50`,
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate font-semibold' },
                        formatCapitalize(
                            Object.entries(DISTRIBUTE_TYPE_ENUM)
                                .find(([, value]) => value === row.original.type)?.[0] ?? '-',
                        ),
                    ),
                ])
            },
        },
        {
            accessorKey: 'channel',
            header: 'Channel',
            meta: {
                class: {
                    td: `max-w-50`,
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate font-semibold' }, row.original.channel.toUpperCase()),
                ])
            },
        },
        {
            accessorKey: 'status',
            header: 'Latest Status',
            meta: {
                class: {
                    td: `max-w-50`,
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h(UBadge, {
                        class: 'w-max',
                        color: DISTRIBUTE_STATUS_COLORS[row.original.status],
                        variant: 'subtle',
                        label: row.original.status,
                    }),
                ])
            },
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
                            onClick: () => openHistoryDialog(row.original),
                        }),
                    ]),
                    h(UTooltip, { text: 'Distribute', delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'neutral',
                            variant: 'ghost',
                            icon: 'lucide:send',
                            onClick: () => openDistributeConfirmation(row.original),
                        }),
                    ]),
                ])
            },
        },
    ]

    if (referenceType.value === DISTRIBUTE_REF_TYPE_ORDERS) {
        columns.unshift({
            accessorKey: 'recipient_name',
            header: 'Buyer',
            meta: {
                class: {
                    td: `max-w-50`,
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate font-semibold' }, row.original.recipient_name),
                ])
            },
        })
        columns.unshift({
            accessorKey: 'reference.invoice',
            header: 'Invoice',
            meta: {
                class: {
                    td: `max-w-50`,
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate font-semibold' }, row.original.reference.invoice),
                ])
            },
        })
    }
    else if (referenceType.value === DISTRIBUTE_REF_TYPE_EVENTS) {
        columns.unshift({
            accessorKey: 'reference.event_name',
            header: 'Event',
            meta: {
                class: {
                    td: 'max-w-50',
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate' }, row.original.reference.event_name || ''),
                ])
            },
        })
        columns.unshift({
            accessorKey: 'recipient_name',
            header: 'Participant',
            meta: {
                class: {
                    td: `max-w-50`,
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate font-semibold' }, row.original.recipient_name),
                ])
            },
        })
    }
    else {
        columns.unshift({
            accessorKey: 'recipient_name',
            header: 'Recipient',
            meta: {
                class: {
                    td: `max-w-50`,
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate font-semibold' }, row.original.recipient_name),
                ])
            },
        })
    }

    return columns
})
</script>

<template>
    <div>
        <UTable
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
    </div>
</template>
