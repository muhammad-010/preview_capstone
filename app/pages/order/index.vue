<script setup lang="ts">
import { toZoned } from '@internationalized/date'

const route = useRoute()
const { tenantId } = useUserState()

const search = ref('')
const query = ref('')
const page = ref(1)
const limit = ref(5)

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const filterStartDateRef = useTemplateRef('filterStartDateRef')
const filterStartDate = shallowRef()

const filterEndDateRef = useTemplateRef('filterEndDateRef')
const filterEndDate = shallowRef()

const filterMinAmount = ref(0)
const filterMaxAmount = ref(0)

const filterPaymentMethod = ref([])

const filterOrderStatus = ref([])
const filterPaymentStatus = ref([])

const filterSlideover = ref(false)
const activeFilterCount = computed(() => {
    let n = 0

    if (filterStartDate.value && filterEndDate.value) n++
    if (filterMinAmount.value && filterMaxAmount.value) n++
    if (filterPaymentMethod.value.length) n++
    if (filterOrderStatus.value.length) n++
    if (filterPaymentStatus.value.length) n++

    return n
})

const { data, pending, refresh } = await useApi(`/api/tenant/${tenantId.value}/order`, {
    transform: res => res.data,
    watch: false,
    query: computed(() => ({
        query: query.value,
        ...(filterStartDate.value ? { created_at_from: toZoned(filterStartDate.value, timeZone).toDate().toISOString() } : {}),
        ...(filterEndDate.value ? { created_at_to: toZoned(filterEndDate.value, timeZone).toDate().toISOString() } : {}),
        ...(filterMinAmount.value ? { total_price_from: filterMinAmount.value } : {}),
        ...(filterMaxAmount.value ? { total_price_to: filterMaxAmount.value } : {}),
        ...(filterPaymentMethod.value.length
            ? { payment_method_ids: filterPaymentMethod.value.join(',') }
            : {}),
        ...(filterOrderStatus.value.length
            ? { order_statuses: filterOrderStatus.value.map(e => TENANT_ORDER_STATUS_ENUM[e]).join(',') }
            : {}),
        ...(filterPaymentStatus.value.length
            ? { payment_statuses: filterPaymentStatus.value.map(e => TENANT_PAYMENT_STATUS_ENUM[e]).join(',') }
            : {}),
        page: page.value,
        limit: limit.value,
    })),
})
watch([page, limit], () => {
    refresh()
})
const list = computed<TenantOrder[]>(() => data.value?.list ?? [])
const summary = computed<TenantOrderSummary | null>(() => data.value?.summary ?? null)
const total = computed(() => data.value?.total_data ?? 0)

function searchData() {
    page.value = 1
    query.value = search.value
    refresh()
}

function clearSearch() {
    page.value = 1
    search.value = ''
    query.value = ''
    refresh()
}

function applyFilter() {
    filterSlideover.value = false
    refresh()
}

function resetFilter() {
    filterStartDate.value = undefined
    filterEndDate.value = undefined
    filterMinAmount.value = 0
    filterMaxAmount.value = 0
    filterOrderStatus.value = []
    filterPaymentStatus.value = []
    filterPaymentMethod.value = []
    refresh()
}

const { data: paymentMethodData } = await useApi(`/api/public/order/payment_method`, {
    transform: res => res.data,
})
const paymentMethods = computed(() => {
    if (!paymentMethodData.value) return []
    const pm = paymentMethodData.value.payment_methods
        .map(pm => ({
            label: pm.name,
            value: pm.id,
        }))
    return pm
})

useHead({
    title: 'Order',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <div
            v-if="summary"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-8"
        >
            <CardTotal
                title="Total Revenue"
                :total="summary.total_revenue"
                icon="lucide:hand-coins"
                icon-color="success"
            />

            <CardTotal
                title="Total Transactions"
                :total="summary.total_transaction"
                icon="lucide:credit-card"
                icon-color="info"
            />

            <CardTotal
                title="Pending Payments"
                :total="summary.pending_payment_count"
                icon="lucide:clock-alert"
                icon-color="warning"
            />

            <CardTotal
                title="Refunded Amount"
                :total="summary.refunded_amount"
                icon="lucide:refresh-ccw"
                icon-color="error"
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
                            :label="`Advanced Filter${activeFilterCount ? ` (${activeFilterCount})` : ''}`"
                            icon="lucide:filter"
                            color="neutral"
                            variant="subtle"
                            @click="filterSlideover = true"
                        />
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
                :tenant-id="tenantId"
                :data="list"
                :total="total"
                :pending="pending"
                with-pagination
            />
        </UCard>

        <USlideover
            v-model:open="filterSlideover"
            title="Advanced Filter"
            :ui="{ content: 'max-w-xl' }"
        >
            <template #body>
                <div class="flex flex-col gap-4">
                    <UFormField
                        label="Order Date"
                    >
                        <UInputDate
                            ref="filterStartDateRef"
                            v-model="filterStartDate"
                            locale="id-ID"
                        >
                            <template #trailing>
                                <UPopover :reference="filterStartDateRef?.inputsRef[3]?.$el">
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        size="sm"
                                        icon="i-lucide-calendar"
                                        aria-label="Select a date"
                                        class="px-0"
                                    />

                                    <template #content>
                                        <UCalendar
                                            v-model="filterStartDate"
                                            class="p-2"
                                        />
                                    </template>
                                </UPopover>
                            </template>
                        </UInputDate>

                        <span class="text-toned mx-2">to</span>

                        <UInputDate
                            ref="filterEndDateRef"
                            v-model="filterEndDate"
                            locale="id-ID"
                        >
                            <template #trailing>
                                <UPopover :reference="filterEndDateRef?.inputsRef[3]?.$el">
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        size="sm"
                                        icon="i-lucide-calendar"
                                        aria-label="Select a date"
                                        class="px-0"
                                    />

                                    <template #content>
                                        <UCalendar
                                            v-model="filterEndDate"
                                            class="p-2"
                                        />
                                    </template>
                                </UPopover>
                            </template>
                        </UInputDate>
                    </UFormField>

                    <UFormField
                        label="Amount (Rp)"
                    >
                        <UInputNumber
                            v-model="filterMinAmount"
                            :min="0"
                            class="max-w-60"
                            :format-options="{
                                style: 'currency',
                                currency: 'IDR',
                                currencyDisplay: 'symbol',
                                maximumFractionDigits: 0,
                            }"
                        />
                        <span class="text-toned mx-2">&mdash;</span>
                        <UInputNumber
                            v-model="filterMaxAmount"
                            :min="0"
                            class="max-w-60"
                            :format-options="{
                                style: 'currency',
                                currency: 'IDR',
                                currencyDisplay: 'symbol',
                                maximumFractionDigits: 0,
                            }"
                        />
                    </UFormField>

                    <UFormField
                        label="Payment Method"
                    >
                        <USelectMenu
                            v-model="filterPaymentMethod"
                            multiple
                            :items="paymentMethods"
                            value-key="value"
                            class="min-w-48"
                            placeholder="Select Payment Method (Empty Means All)"
                            clear
                        />
                    </UFormField>

                    <UFormField
                        label="Order Status"
                    >
                        <UCheckboxGroup
                            v-model="filterOrderStatus"
                            indicator="end"
                            variant="card"
                            :items="TENANT_ORDER_STATUS_LIST"
                            :ui="{ fieldset: 'gap-y-2' }"
                        />
                    </UFormField>

                    <UFormField
                        label="Payment Status"
                    >
                        <UCheckboxGroup
                            v-model="filterPaymentStatus"
                            indicator="end"
                            variant="card"
                            :items="TENANT_PAYMENT_STATUS_LIST"
                            :ui="{ fieldset: 'gap-y-2' }"
                        />
                    </UFormField>
                </div>
            </template>

            <template #footer>
                <div class="flex items-center justify-center w-full gap-4">
                    <UButton
                        color="neutral"
                        variant="soft"
                        label="Reset Filter"
                        class="text-lg font-semibold py-3 w-full"
                        @click="resetFilter()"
                    />
                    <UButton
                        label="Apply Filter"
                        class="text-lg font-semibold py-3 w-full"
                        @click="applyFilter()"
                    />
                </div>
            </template>
        </USlideover>
    </div>
</template>
