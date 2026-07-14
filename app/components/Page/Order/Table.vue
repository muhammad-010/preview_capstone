<script setup lang="ts">
type OrderStatus = 'Success' | 'Pending' | 'Waiting Payment' | 'Failed' | 'Refunded'
type OrderPaymentStatus = 'paid' | 'pending' | 'expired' | 'failed' | 'refunded'
interface Order {
  order_id: number
  invoice: string
  name: string
  amount: number
  payment_method: {
    name: string
    detail: string
  }
  payment_status: OrderPaymentStatus
  status: OrderStatus
  date: ISOString
}
const ORDER_STATUS_COLORS: Record<
    OrderStatus, 'success' | 'error' | 'primary' | 'neutral' | 'info' | 'warning' | 'secondary'
> = {
    ['Success']: 'success',
    ['Failed']: 'error',
    ['Refunded']: 'secondary',
    ['Pending']: 'warning',
    ['Waiting Payment']: 'info',
} as const
const PAYMENT_ORDER_STATUS_COLORS: Record<
    OrderPaymentStatus, 'success' | 'error' | 'primary' | 'neutral' | 'info' | 'warning' | 'secondary'
> = {
    ['paid']: 'success',
    ['failed']: 'error',
    ['refunded']: 'secondary',
    ['pending']: 'warning',
    ['expired']: 'neutral',
} as const

import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

defineProps<{
    data: Order[]
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })


function formatCurrency(value: number, currency?: string): string {
    const formatter = getCurrencyFormatter(currency)
    return formatter.format(value)
}

const detailModal = ref(false)
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
                return h('div', { class: 'truncate' }, row.original.invoice)
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
                return h('div', { class: 'truncate' }, row.original.name)
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
                return h('div', { class: 'truncate' }, formatCurrency(row.original.amount))
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
                    h('div', { class: 'truncate' }, row.original.payment_method.name || ''),
                    h('div', { class: 'truncate text-xs' }, row.original.payment_method.detail || ''),
                ])
            },
        },
        {
            accessorKey: 'payment_status',
            header: 'Status',
            cell: ({ row }) => {
                return h(UBadge, {
                    color: PAYMENT_ORDER_STATUS_COLORS[row.getValue('payment_status') as OrderPaymentStatus],
                    variant: 'subtle',
                    label: row.original.payment_status,
                })
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                return h(UBadge, {
                    color: ORDER_STATUS_COLORS[row.getValue('status') as OrderStatus],
                    variant: 'subtle',
                    label: row.original.status,
                })
            },
        },
        {
            accessorKey: 'date',
            header: 'Date',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', {}, row.original.date ? formatLongDate(row.original.date) : ''),
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
            cell: () => {
                return h('div', { class: 'inline-flex gap-2' }, [
                    h(UTooltip, { text: 'Detail', delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'neutral',
                            variant: 'ghost',
                            icon: 'lucide:info',
                            onClick: () => detailModal.value = true,
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
    ] as TableColumn<Order>[]
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

  <UModal
      v-model:open="detailModal"
    title="Order Detail"
  >
    <template #body>
      <section class="flex justify-between items-center border-b border-default pb-4 mb-4">
          <DetailSectionData
              title="Invoice ID"
              subtitle="INV/1/1/20260101"
          />
          <DetailSectionData title="Payment Status">
              <UBadge
                  color="success"
                  variant="subtle"
                  label="Paid"
              />
          </DetailSectionData>
          <DetailSectionData title="Order Status">
              <UBadge
                  color="success"
                  variant="subtle"
                  label="Success"
              />
          </DetailSectionData>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <DetailSectionTitle title="Customer Info" />
            <DetailSectionData
                title="Name"
                subtitle="Ramona"
                class="mb-4"
            />
            <DetailSectionData
                title="Email"
                subtitle="ramona@mythag.com"
                class="mb-4"
            />
            <DetailSectionData
                title="Event"
                subtitle="Keeper's Enrollment"
                class="mb-4"
            />
        </div>

        <div>
            <DetailSectionTitle title="Payment Info" />
            <DetailSectionData
                title="Amount"
                :subtitle="formatCurrency(1500000)"
                class="mb-4"
            />
            <DetailSectionData
                title="Method"
                subtitle="Virtual Account (BCA VA)"
                class="mb-4"
            />
            <DetailSectionData
                title="Ordered At"
                :subtitle="formatLongDate('2026-07-06T17:16:32+07:00')"
                class="mb-4"
            />
            <DetailSectionData
                title="Paid At"
                :subtitle="formatLongDate('2026-07-06T17:16:32+07:00')"
                class="mb-4"
            />
        </div>
      </section>
    </template>
  </UModal>
    </div>
</template>
