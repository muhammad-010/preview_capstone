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
            meta: {
                class: {
                    td: `max-w-[${TABLE_TRUNCATED_COLUMN}]`,
                },
            },
            cell: ({ row }) => {
                return h('div', { class: 'truncate font-semibold' }, row.original.name)
            },
        },
        {
            accessorKey: 'email',
            header: 'Contact',
            meta: {
                class: {
                    td: `max-w-[${TABLE_TRUNCATED_COLUMN}]`,
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate' }, row.original.email || ''),
                    h('div', { class: 'truncate' }, row.original.phone?.number || ''),
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
            meta: {
                class: {
                    td: `w-[${TABLE_ACTION_COLUMN}]`,
                },
            },
            cell: ({ row }) => {
                return h('div', { class: 'inline-flex gap-2' }, [
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
