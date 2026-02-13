<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

defineProps<{
    data: Tenant[]
    total: number
    pending: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })

function useColumns() {
    const UBadge = resolveComponent('UBadge')
    const UButton = resolveComponent('UButton')

    return [
        {
            accessorKey: 'name',
            header: 'Tenant Name',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', { class: 'font-semibold' }, row.original.name),
                    h('br'),
                    h('span', { class: 'text-sm' }, row.original.owner?.name || ''),
                ])
            },
        },
        {
            accessorKey: 'owner.email',
            header: 'Owner Email',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', {}, row.original.owner?.email || ''),
                    h('br'),
                    h('span', { class: 'text-sm' }, row.original.owner?.phone?.number || ''),
                ])
            },
        },
        {
            accessorKey: 'plan',
            header: 'Plan',
            cell: ({ row }) => {
                return h(UBadge, {
                    color: 'secondary',
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
            cell: ({ row }) => {
                return h('div', { class: 'flex gap-2' }, [
                    h(UButton, {
                        color: 'secondary',
                        variant: 'ghost',
                        icon: 'lucide:pencil',
                        to: `tenants/${row.original.tenant_id}/edit`,
                    }),
                    h(UButton, {
                        color: 'secondary',
                        variant: 'ghost',
                        icon: 'lucide:info',
                        to: `tenants/${row.original.tenant_id}`,
                    }),
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

        <MiscPagination
            v-if="withPagination"
            v-model:limit="limit"
            v-model:page="page"
            :total="total"
        />
    </div>
</template>
