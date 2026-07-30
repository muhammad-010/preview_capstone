<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const route = useRoute()
const { tenantId } = useUserState()

const search = ref('')
const query = ref('')
const page = ref(1)
const limit = ref(5)

const filterSlideover = ref(false)
const filterStartDateRef = useTemplateRef('filterStartDateRef')
const filterStartDate = shallowRef(new CalendarDate(2022, 1, 10))

const filterEndDateRef = useTemplateRef('filterEndDateRef')
const filterEndDate = shallowRef(new CalendarDate(2022, 2, 10))

const filterMinAmount = ref(0)
const filterMaxAmount = ref(0)

const filterPaymentMethod = ref('all')

const filterOrderStatus = ref([])
const filterPaymentStatus = ref([])

const { data, pending, refresh } = await useApi(`/api/tenant/${tenantId.value}/order`, {
    transform: res => res.data,
    query: {
        query,
        ...(filterMinAmount.value ? { total_price_from: filterMinAmount.value } : {}),
        ...(filterMaxAmount.value ? { total_price_to: filterMaxAmount.value } : {}),
        ...(filterOrderStatus.value.length ? { order_statuses: filterOrderStatus.value.join(',') } : {}),
        ...(filterPaymentStatus.value.length ? { payment_statuses: filterPaymentStatus.value.join(',') } : {}),
        page,
        limit,
    },
    watch: [page, limit],
})
const list = computed<TenantOrder[]>(() => data.value?.list ?? [])
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
            />

            <CardTotal
                title="Total Transactions"
                :total="847"
                icon="lucide:credit-card"
                icon-color="info"
            />

            <CardTotal
                title="Pending Payments"
                :total="23"
                icon="lucide:clock-alert"
                icon-color="warning"
            />

            <CardTotal
                title="Refunded Amount"
                :total="4250000"
                format-number="currency"
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
                            label="Advanced Filter"
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
                            :items="[{ label: 'All Payment Method', value: 'all' }]"
                            value-key="value"
                        />
                    </UFormField>

                    <UFormField
                        label="Order Status"
                    >
                        <UCheckboxGroup
                            v-model="filterOrderStatus"
                            variant="table"
                            :items="['Success', 'Pending', 'Waiting Payment', 'Failed', 'Refunded']"
                        />
                    </UFormField>

                    <UFormField
                        label="Payment Status"
                    >
                        <UCheckboxGroup
                            v-model="filterPaymentStatus"
                            variant="table"
                            :items="['Paid', 'Pending', 'Expired', 'Failed', 'Refunded']"
                        />
                    </UFormField>
                </div>
            </template>

            <template #footer>
                <UButton
                    label="Apply Filter"
                    block
                    class="text-xl font-semibold py-3"
                    @click="refresh()"
                />
            </template>
        </USlideover>
    </div>
</template>
