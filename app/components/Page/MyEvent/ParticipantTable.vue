<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

defineProps<{
    data: Participant[]
    eventId: number
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })

function useColumns() {
    const UBadge = resolveComponent('UBadge')
    const UProgress = resolveComponent('UProgress')
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
            header: 'Contact',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', {}, row.original.email || ''),
                    h('br', {}),
                    h('span', {}, row.original.phone_number || ''),
                ])
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
    ] as TableColumn<Participant>[]

    return { columns, tableRef }
}

const { columns, tableRef } = useColumns()
</script>

<template>
    <div>
        <UTable
            ref="tableRef"
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
