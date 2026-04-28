<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

defineProps<{
    data: Tenant[]
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })

function useColumns() {
    const UBadge = resolveComponent('UBadge')
    const UButton = resolveComponent('UButton')
    const UTooltip = resolveComponent('UTooltip')

    return [
        {
            accessorKey: 'name',
            header: 'Tenant Name',
            meta: {
                class: {
                    td: 'max-w-50',
                },
            },
            cell: ({ row }) => {
                return h('div', {
                    class: 'cursor-pointer',
                    onClick: () => navigateTo(`/tenants/${row.original.tenant_id}`),
                }, [
                    h('div', { class: 'truncate font-semibold' }, row.original.name),
                    h('div', { class: 'truncate text-sm' }, row.original.owner?.name || ''),
                ])
            },
        },
        {
            accessorKey: 'owner.email',
            header: 'Admin Email',
            meta: {
                class: {
                    td: 'max-w-50',
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate' }, row.original.owner?.email || ''),
                    h('div', { class: 'truncate text-sm' }, row.original.owner?.phone?.number || ''),
                ])
            },
        },
        {
            accessorKey: 'plan',
            header: 'Plan',
            cell: ({ row }) => {
                return h(UBadge, {
                    color: 'neutral',
                    variant: 'subtle',
                    label: row.original.plan,
                })
            },
        },
        {
            accessorKey: 'total_event',
            header: 'Events',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                return h(UBadge, {
                    color: STATUS_COLORS[row.getValue('status') as Status],
                    variant: 'subtle',
                    label: row.original.status,
                })
            },
        },
        {
            accessorKey: 'tenant_id',
            header: 'Action',
            meta: {
                class: {
                    td: 'w-[1%]',
                },
            },
            cell: ({ row }) => {
                return h('div', { class: 'inline-flex gap-2' }, [
                    h(UTooltip, { text: 'Edit', delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'neutral',
                            variant: 'ghost',
                            icon: 'lucide:pencil',
                            to: `tenants/${row.original.tenant_id}/edit`,
                        }),
                    ]),
                    h(UTooltip, { text: 'Detail', delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'neutral',
                            variant: 'ghost',
                            icon: 'lucide:info',
                            to: `/tenants/${row.original.tenant_id}`,
                        }),
                    ]),
                ])
            },
        },
    ] as TableColumn<Tenant>[]
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
