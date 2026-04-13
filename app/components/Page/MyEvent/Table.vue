<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

defineProps<{
    data: TenantEvent[]
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })

function useColumns() {
    const UProgress = resolveComponent('UProgress')
    const UBadge = resolveComponent('UBadge')
    const UButton = resolveComponent('UButton')
    const UTooltip = resolveComponent('UTooltip')

    return [
        {
            accessorKey: 'name',
            header: 'Event Name',
            cell: ({ row }) => {
                return h('div', {
                    class: 'cursor-pointer',
                    onClick: () => navigateTo(`/my-events/${row.original.event_id}`),
                }, [
                    h('span', { class: 'font-semibold' }, row.original.name),
                ])
            },
        },
        {
            accessorKey: 'start_time',
            header: 'Date',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', {}, row.original.start_time ? formatLongDate(row.original.start_time) : ''),
                ])
            },
        },
        {
            accessorKey: 'location',
            header: 'Venue',
        },
        {
            accessorKey: 'capacity',
            header: 'Capacity',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', {}, `${row.original.capacity?.used || 0}/${row.original.capacity?.total || 0}`),
                    h(UProgress, {
                        max: row.original.capacity?.total || 0,
                        modelValue: row.original.capacity?.used || 0,
                    }),
                ])
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                return h(UBadge, {
                    color: TENANT_EVENT_STATUS_COLORS[row.getValue('status') as TenantEventStatus],
                    variant: 'subtle',
                    label: row.original.status,
                })
            },
        },
        {
            accessorKey: 'event_id',
            header: 'Action',
            cell: ({ row }) => {
                return h('div', { class: 'flex gap-2' }, () => {
                    const actions = [
                        h(UTooltip, { text: 'Detail', delayDuration: 0 }, () => [
                            h(UButton, {
                                color: 'neutral',
                                variant: 'ghost',
                                icon: 'lucide:info',
                                to: `/my-events/${row.original.event_id}`,
                            }),

                        ]),
                    ]
                    if (row.original.status !== TENANT_EVENT_STATUS_COMPLETED) {
                        actions.push(
                            h(UTooltip, { text: 'Check-In', delayDuration: 0 }, () => [
                                h(UButton, {
                                    color: 'primary',
                                    icon: 'lucide:scan-qr-code',
                                    disabled: !SCANNABLE_EVENT.includes(row.original.status),
                                    to: `/check-in/${row.original.event_id}`,
                                }),
                            ]),
                        )
                    }
                    return actions
                })
            },
        },
    ] as TableColumn<TenantEvent>[]
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
