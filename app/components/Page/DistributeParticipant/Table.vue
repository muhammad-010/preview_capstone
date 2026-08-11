<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

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

const props = defineProps<{
    tenantId: number
    data: DistributeParticipant[]
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })
const emit = defineEmits([EMIT_TABLE_REFRESH, EMIT_TABLE_DISTRIBUTE, EMIT_OPEN_DISTRIBUTE_HISTORY])

/*
const { $api } = useNuxtApp()
const { errorToast } = useErrorToast()
*/

// HISTORION
function openHistoryDialog(data: DistributeParticipant) {
    emit(EMIT_OPEN_DISTRIBUTE_HISTORY, data)
}

// DISTRIBUTION
function openDistributeConfirmation(data: DistributeParticipant) {
    emit(EMIT_TABLE_DISTRIBUTE, data)
}

/*
function triggerRefresh(skipResetPage?: boolean) {
    if (!skipResetPage) {
        page.value = 1
    }
    clearSelection(false)
    emit(EMIT_TABLE_REFRESH)
}
*/

function useColumns() {
    const UButton = resolveComponent('UButton')
    const UTooltip = resolveComponent('UTooltip')

    return [
        {
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
        },
        {
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
        },
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
                    h('div', { class: 'truncate font-semibold' }, row.original.type),
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
                    h('div', { class: 'truncate font-semibold' }, row.original.channel),
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
                    h('div', { class: 'truncate font-semibold' }, row.original.status),
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
    ] as TableColumn<DistributeParticipant>[]
}

const columns = useColumns()
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
