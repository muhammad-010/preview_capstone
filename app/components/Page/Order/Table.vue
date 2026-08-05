<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const props = defineProps<{
    tenantId: number
    data: TenantOrder[]
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })

const { $api } = useNuxtApp()
const { errorToast } = useErrorToast()

function useColumns() {
    const UBadge = resolveComponent('UBadge')
    const UButton = resolveComponent('UButton')
    const UTooltip = resolveComponent('UTooltip')

    return [
        {
            accessorKey: 'invoice',
            header: 'Invoice',
            meta: {
                class: {
                    td: 'max-w-50',
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate' }, row.original.invoice || ''),
                ])
            },
        },
        {
            accessorKey: 'store_title',
            header: 'Store',
            meta: {
                class: {
                    td: 'max-w-50',
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate' }, row.original.store_title || ''),
                ])
            },
        },
        {
            accessorKey: 'name',
            header: 'Name',
            meta: {
                class: {
                    td: 'max-w-50',
                },
            },
            cell: ({ row }) => {
                return h('div', { class: 'truncate' }, row.original.user_name)
            },
        },
        {
            accessorKey: 'amount',
            header: 'Amount',
            meta: {
                class: {
                    td: 'max-w-50',
                },
            },
            cell: ({ row }) => {
                return h('div', { class: 'truncate' }, row.original.total_price)
            },
        },
        {
            accessorKey: 'payment_method',
            header: 'Method',
            meta: {
                class: {
                    td: 'max-w-50',
                },
            },
            cell: ({ row }) => {
                return h('div', {}, [
                    h('div', { class: 'truncate' }, row.original.payment_method || ''),
                    // h('div', { class: 'truncate text-xs' }, row.original.payment_method.detail || ''),
                ])
            },
        },
        {
            accessorKey: 'payment_status',
            header: 'Payment Status',
            cell: ({ row }) => {
                return h(UBadge, {
                    color: TENANT_PAYMENT_STATUS_COLORS[row.getValue('payment_status') as TenantPaymentStatus],
                    variant: 'subtle',
                    label: row.original.payment_status,
                })
            },
        },
        {
            accessorKey: 'order_status',
            header: 'Order Status',
            cell: ({ row }) => {
                return h(UBadge, {
                    color: TENANT_ORDER_STATUS_COLORS[row.getValue('order_status') as TenantOrderStatus],
                    variant: 'subtle',
                    label: row.original.order_status,
                })
            },
        },
        {
            accessorKey: 'date',
            header: 'Date',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', {}, row.original.created_at ? formatLongDate(row.original.created_at) : ''),
                ])
            },
        },
        {
            accessorKey: 'order_id',
            header: 'Action',
            meta: {
                class: {
                    td: 'w-[1%]',
                },
            },
            cell: ({ row }) => {
                return h('div', { class: 'inline-flex gap-2' }, [
                    h(UTooltip, { text: 'Detail', delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'neutral',
                            variant: 'ghost',
                            icon: 'lucide:info',
                            onClick: () => openDetail(row.original.order_id),
                        }),
                    ]),
                    h(UTooltip, { text: 'Refund', delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'neutral',
                            variant: 'ghost',
                            icon: 'lucide:refresh-ccw',
                        }),
                    ]),
                ])
            },
        },
    ] as TableColumn<TenantOrder>[]
}

const columns = useColumns()

// DETAILION
const detailModal = ref(false)
const target = ref<TenantOrder | undefined>()

async function openDetail(orderId: number) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/order/${orderId}/detail`)
        if (data.success) {
            target.value = cloneObject(data.data)
            detailModal.value = true
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to get order detail' })
    }
}
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

        <PageOrderModalDetail
            v-model:open="detailModal"
            :item="target"
        />
    </div>
</template>
