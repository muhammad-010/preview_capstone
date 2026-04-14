<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const { id } = useUserState()

defineProps<{
    data: User[]
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })

function useColumns(uId: number) {
    const UBadge = resolveComponent('UBadge')
    const UButton = resolveComponent('UButton')
    const UTooltip = resolveComponent('UTooltip')

    return [
        {
            accessorKey: 'name',
            header: 'Member',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', { class: 'font-semibold' }, row.original.name),
                    h('br'),
                    h('span', { class: 'text-sm' }, row.original.email || ''),
                ])
            },
        },
        {
            accessorKey: 'phone.number',
            header: 'Phone',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', { class: 'text-sm' }, row.original.phone?.number || ''),
                ])
            },
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
            accessorKey: 'user_id',
            header: 'Action',
            cell: ({ row }) => {
                return h('div', { class: 'flex gap-2' }, [
                    h(UTooltip, { text: 'Edit', delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'neutral',
                            variant: 'ghost',
                            disabled: uId === row.original.user_id,
                            icon: 'lucide:pencil',
                            to: `/members/${row.original.user_id}/edit`,
                        }),
                    ]),
                ])
            },
        },
    ] as TableColumn<User>[]
}

const columns = useColumns(id.value)
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
