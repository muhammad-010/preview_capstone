<script setup lang="ts">
import type { BillingTenant, BillingStatus } from '@@/shared/types/data'

const route = useRoute()
const toast = useToast()

const billingTenants: BillingTenant[] = [
    {
        tenant_id: 1,
        tenant: 'Jogja Run 10K',
        plan: 'Pro',
        status: 'Menunggak',
        amount: 750000,
        due_date: '04 Sep 2026',
        overdue_days: 3,
    },
    {
        tenant_id: 2,
        tenant: 'Bazaar Kriya Nusantara',
        plan: 'Basic',
        status: 'Menunggu Verifikasi',
        amount: 350000,
        due_date: '02 Sep 2026',
        payment_note: 'Transfer manual masuk',
    },
    {
        tenant_id: 4,
        tenant: 'Tech Summit 2026',
        plan: 'Enterprise',
        status: 'Lunas',
        amount: 2500000,
        due_date: '05 Sep 2026',
    },
    {
        tenant_id: 5,
        tenant: 'Tech Summit 2026',
        plan: 'Enterprise',
        status: 'Lunas',
        amount: 2500000,
        due_date: '05 Sep 2026',
    },
    {
        tenant_id: 6,
        tenant: 'Tech Summit 2026',
        plan: 'Enterprise',
        status: 'Lunas',
        amount: 2500000,
        due_date: '05 Sep 2026',
    },
    {
        tenant_id: 7,
        tenant: 'Tech Summit 2026',
        plan: 'Enterprise',
        status: 'Lunas',
        amount: 2500000,
        due_date: '05 Sep 2026',
    },
    {
        tenant_id: 8,
        tenant: 'Tech Summit 2026',
        plan: 'Enterprise',
        status: 'Lunas',
        amount: 2500000,
        due_date: '05 Sep 2026',
    },
]

const statuses: Array<BillingStatus | 'Semua'> = [
    'Semua',
    'Menunggak',
    'Menunggu Verifikasi',
    'Lunas',
]

async function useList() {
    const activeStatus = ref<BillingStatus | 'Semua'>('Semua')
    const page = ref(1)
    const limit = ref(5)
    const list = ref<BillingTenant[]>([])
    const total = ref(0)

    function refresh() {
        const filtered
            = activeStatus.value === 'Semua'
                ? billingTenants
                : billingTenants.filter(item => item.status === activeStatus.value)

        total.value = filtered.length
        const start = (page.value - 1) * limit.value
        list.value = filtered.slice(start, start + limit.value)
    }

    onMounted(() => {
        refresh()
    })

    watch([page, limit], () => {
        refresh()
    })

    watch(activeStatus, () => {
        page.value = 1
        refresh()
    })

    return {
        activeStatus,
        page,
        limit,
        list,
        total,
    }
}

const { activeStatus, page, limit, list, total } = await useList()

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount)
}

function statusColor(status: BillingStatus) {
    if (status === 'Lunas') return 'success'
    if (status === 'Menunggu Verifikasi') return 'warning'
    return 'error'
}

function statusIcon(status: BillingStatus) {
    if (status === 'Lunas') return 'lucide:circle-check'
    if (status === 'Menunggu Verifikasi') return 'lucide:clock-3'
    return 'lucide:circle-alert'
}

function statusLabel(item: BillingTenant) {
    return item.overdue_days
        ? `${item.status} - ${item.overdue_days} hari`
        : item.status
}

function exportCsv() {
    toast.add({
        title: 'Export CSV',
        description: 'Data billing sedang disiapkan.',
        color: 'info',
    })
}

useHead({ title: 'Billing' })
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div class="flex flex-wrap gap-2">
                <UButton
                    v-for="status in statuses"
                    :key="status"
                    :color="activeStatus === status ? 'primary' : 'neutral'"
                    :variant="activeStatus === status ? 'solid' : 'outline'"
                    class="rounded-full"
                    @click="activeStatus = status"
                >
                    {{ status }}
                </UButton>
            </div>
            <UButton
                color="neutral"
                variant="outline"
                icon="lucide:download"
                @click="exportCsv"
            >
                Export CSV
            </UButton>
        </div>

        <UCard class="mb-7">
            <div class="hidden overflow-x-auto md:block">
                <table class="w-full text-sm">
                    <thead>
                        <tr>
                            <th
                                class="border-b border-default bg-elevated px-4 py-3 text-left text-sm font-medium text-toned"
                            >
                                Tenant
                            </th>
                            <th
                                class="border-b border-default bg-elevated px-4 py-3 text-left text-sm font-medium text-toned"
                            >
                                Tier
                            </th>
                            <th
                                class="border-b border-default bg-elevated px-4 py-3 text-left text-sm font-medium text-toned"
                            >
                                Status Pembayaran
                            </th>
                            <th
                                class="border-b border-default bg-elevated px-4 py-3 text-left text-sm font-medium text-toned"
                            >
                                Nominal
                            </th>
                            <th
                                class="border-b border-default bg-elevated px-4 py-3 text-left text-sm font-medium text-toned"
                            >
                                Jatuh Tempo
                            </th>
                            <th
                                class="border-b border-default bg-elevated px-4 py-3 text-left text-sm font-medium text-toned"
                            >
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="item in list"
                            :key="item.tenant_id"
                            class="border-b border-default last:border-b-0"
                        >
                            <td class="px-4 py-3 font-semibold">
                                {{ item.tenant }}
                            </td>
                            <td class="px-4 py-3">
                                <UBadge
                                    color="neutral"
                                    variant="subtle"
                                >
                                    {{ item.plan }}
                                </UBadge>
                            </td>
                            <td class="px-4 py-3">
                                <UBadge
                                    :color="statusColor(item.status)"
                                    variant="subtle"
                                >
                                    <UIcon
                                        :name="statusIcon(item.status)"
                                        class="size-3.5"
                                    />
                                    {{ statusLabel(item) }}
                                </UBadge>
                            </td>
                            <td class="px-4 py-3">
                                {{ formatCurrency(item.amount) }}
                            </td>
                            <td class="px-4 py-3">
                                {{ item.due_date }}
                            </td>
                            <td class="px-4 py-3 text-right">
                                <UButton
                                    :to="`/billing/${item.tenant_id}`"
                                    color="neutral"
                                    variant="outline"
                                    size="sm"
                                    trailing-icon="lucide:arrow-down"
                                >
                                    Lihat Riwayat
                                </UButton>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="space-y-3 md:hidden">
                <NuxtLink
                    v-for="item in list"
                    :key="item.tenant_id"
                    :to="`/billing/${item.tenant_id}`"
                    class="block rounded-lg border border-default p-3 text-highlighted no-underline"
                >
                    <div class="flex items-center justify-between gap-3">
                        <strong>{{ item.tenant }}</strong>
                        <UBadge
                            :color="statusColor(item.status)"
                            variant="subtle"
                        >
                            {{
                                item.status === "Menunggu Verifikasi"
                                    ? "Verifikasi"
                                    : item.status
                            }}
                        </UBadge>
                    </div>
                    <small>{{ formatCurrency(item.amount) }} · jatuh tempo
                        {{ item.due_date }} · {{ item.plan }}
                    </small>
                </NuxtLink>
            </div>

            <div
                v-if="total === 0"
                class="py-10 text-center text-toned"
            >
                No Data
            </div>

            <DataTablePagination
                v-if="total > 0"
                v-model:page="page"
                v-model:limit="limit"
                :total="total"
            />
        </UCard>
    </div>
</template>
