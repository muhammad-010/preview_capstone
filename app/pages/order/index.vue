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

const route = useRoute()
//const { tenantId } = useUserState()

const search = ref('')
const query = ref('')
const page = ref(1)
const limit = ref(5)

/*
const { data, pending, refresh } = await useApi(`/api/tenant/${tenantId.value}/event`, {
    transform: res => res.data,
    query: { query, page, limit },
    watch: [page, limit],
})
*/
const pending = ref(false)
const data = ref({
  order: [
    {
        order_id: 1,
        invoice: 'INV/1/1/20260101',
        name: 'Ramona',
        amount: 1500000,
        payment_method: {
          name: 'Virtual Account',
          detail: 'BCA VA',
        },
        payment_status: 'paid' as OrderPaymentStatus,
        status: 'Success' as OrderStatus,
        date: '2026-07-06T17:16:32+07:00',
    },
    {
        order_id: 2,
        invoice: 'INV/2/2/20260101',
        name: 'Tawil',
        amount: 1500000,
        payment_method: {
          name: 'E-Wallet',
          detail: 'GoPay',
        },
        payment_status: 'pending' as OrderPaymentStatus,
        status: 'Pending' as OrderStatus,
        date: '2026-07-06T17:16:32+07:00',
    },
    {
        order_id: 3,
        invoice: 'INV/3/3/20260101',
        name: 'Miryam',
        amount: 500000,
        payment_method: {
          name: 'Retail Outlet',
          detail: 'Alfamart',
        },
        payment_status: 'expired' as OrderPaymentStatus,
        status: 'Waiting Payment' as OrderStatus,
        date: '2026-07-06T17:16:32+07:00',
    },
    {
        order_id: 4,
        invoice: 'INV/4/4/20260101',
        name: 'Arachne',
        amount: 250000,
        payment_method: {
          name: 'Credit Card',
          detail: 'VISA',
        },
        payment_status: 'failed' as OrderPaymentStatus,
        status: 'Failed' as OrderStatus,
        date: '2026-07-06T17:16:32+07:00',
    },
    {
        order_id: 5,
        invoice: 'INV/5/5/20260101',
        name: 'Thais',
        amount: 750000,
        payment_method: {
          name: 'QRIS',
          detail: 'QRIS',
        },
        payment_status: 'refunded' as OrderPaymentStatus,
        status: 'Refunded' as OrderStatus,
        date: '2026-07-06T17:16:32+07:00',
    },
  ],
  total_data: 5,
})
const list = computed<Order[]>(() => data.value?.order ?? [])
const total = computed(() => data.value?.total_data ?? 0)

function searchData() {
    page.value = 1
    query.value = search.value
    //refresh()
}

function clearSearch() {
    page.value = 1
    search.value = ''
    query.value = ''
    //refresh()
}

useHead({
    title: 'Order',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-8">
            <CardTotal
                title="Total Revenue"
                :total="186450000"
                format-number="currency"
                icon="lucide:hand-coins"
                icon-color="success"
                with-stats
                stats="15%"
                stats-status="up"
                stats-text="Since yesterday"
            />

            <CardTotal
                title="Total Transactions"
                :total="847"
                icon="lucide:credit-card"
                icon-color="info"
                with-stats
                stats="15%"
                stats-status="down"
                stats-text="Since yesterday"
            />

            <CardTotal
                title="Pending Payments"
                :total="23"
                icon="lucide:clock-alert"
                icon-color="warning"
                with-stats
                stats="15%"
                stats-status="down"
                stats-text="Since yesterday"
                stats-text-status="up"
            />

            <CardTotal
                title="Refunded Amount"
                :total="4250000"
                format-number="currency"
                icon="lucide:refresh-ccw"
                icon-color="error"
                with-stats
                stats="2%"
                stats-status="up"
                stats-text="Since yesterday"
                stats-text-status="down"
            />
        </div>

        <UCard>
            <template #header>
                <div class="card-toolbar">
                    <DataTableSearch
                        v-model="search"
                        class="card-toolbar-left"
                        @search="searchData"
                        @clear="clearSearch"
                    />

                    <div class="card-toolbar-actions">
                        <UButton
                            color="primary"
                            icon="lucide:download"
                            class="cursor-pointer"
                        >
                            Export Report
                        </UButton>
                    </div>
                </div>
            </template>

            <PageOrderTable
                v-model:limit="limit"
                v-model:page="page"
                :data="list"
                :total="total"
                :pending="pending"
                with-pagination
            />
        </UCard>
    </div>
</template>
