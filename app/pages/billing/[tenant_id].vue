<script setup lang="ts">
import type { BillingHistory, BillingStatus } from '@@/shared/types/data'

const route = useRoute()
const toast = useToast()
const tenantId = Number(route.params.tenant_id)
const tenantNames: Record<number, string> = {
    1: 'Jogja Run 10K',
    2: 'Bazaar Kriya Nusantara',
    3: 'Tech Summit 2026',
    4: 'Tech Summit 2026',
    5: 'Tech Summit 2026',
    6: 'Tech Summit 2026',
    7: 'Tech Summit 2026',
    8: 'Tech Summit 2026',
}
const tenantName = tenantNames[tenantId] || 'Tenant'

const DUMMY_HISTORIES: BillingHistory[] = [
    {
        id: 1,
        invoice: 'INV-2026-081',
        period: 'Sep 2026',
        amount: 750000,
        status: 'Menunggak',
        due_date: '04 Sep 2026',
        grace_period: '11 Sep 2026',
        overdue_days: 3,
    },
    {
        id: 2,
        invoice: 'INV-2026-072',
        period: 'Agu 2026',
        amount: 750000,
        status: 'Menunggu Verifikasi',
        due_date: '04 Agu 2026',
        grace_period: '-',
        can_confirm: true,
    },
    {
        id: 3,
        invoice: 'INV-2026-063',
        period: 'Jul 2026',
        amount: 750000,
        status: 'Lunas',
        due_date: '04 Jul 2026',
        grace_period: '-',
    },
]

async function useList() {
    const page = ref(1)
    const limit = ref(5)
    const list = ref<BillingHistory[]>([])
    const total = ref(0)

    function refresh() {
        total.value = DUMMY_HISTORIES.length
        const start = (page.value - 1) * limit.value
        list.value = DUMMY_HISTORIES.slice(start, start + limit.value)
    }

    onMounted(() => {
        refresh()
    })

    watch([page, limit], () => {
        refresh()
    })

    return {
        page,
        limit,
        list,
        total,
    }
}

const { page, limit, list, total } = await useList()

const overdueInvoice = computed(() =>
    list.value.find(item => item.status === 'Menunggak'),
)

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

function confirmPayment(invoice: BillingHistory) {
    const history = DUMMY_HISTORIES.find(item => item.id === invoice.id)
    invoice.status = 'Lunas'
    invoice.can_confirm = false
    if (history) {
        history.status = 'Lunas'
        history.can_confirm = false
    }
    toast.add({
        title: 'Pembayaran dikonfirmasi',
        description: `${invoice.invoice} sekarang berstatus Lunas.`,
        color: 'success',
    })
}

function exportCsv() {
    toast.add({
        title: 'Export CSV',
        description: `Riwayat billing ${tenantName} sedang disiapkan.`,
        color: 'info',
    })
}

useHead({ title: computed(() => `Billing - ${tenantName}`) })
setLayoutPropState(
    buildLayoutProp(APP_ROUTES, route.path, {
        [':tenant_id']: {
            param: route.params.tenant_id as string,
            label: tenantName,
        },
    }),
)
</script>

<template>
    <div class="my-8">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3>Riwayat Tagihan: {{ tenantName }}</h3>
            <div class="flex flex-wrap gap-2">
                <UButton
                    color="neutral"
                    variant="outline"
                    icon="lucide:download"
                    @click="exportCsv"
                >
                    Export CSV
                </UButton>
                <UButton
                    to="/billing"
                    color="neutral"
                    variant="outline"
                    icon="lucide:arrow-left"
                >
                    Kembali
                </UButton>
            </div>
        </div>

        <div
            v-if="overdueInvoice"
            class="mb-4 flex items-start gap-3 rounded-lg bg-warning-50 p-3 text-sm text-warning-800"
        >
            <UIcon name="lucide:triangle-alert" class="size-5 shrink-0" />
            <div>
                <strong>Menunggak {{ overdueInvoice.overdue_days }} hari.</strong>
                Masa tenggang berakhir {{ overdueInvoice.grace_period }} (asumsi 7 hari
                kalender). Setelah itu status otomatis "Ditangguhkan" (read-only).
            </div>
        </div>

        <UCard class="mb-4">
            <div class="hidden overflow-x-auto md:block">
                <table class="w-full text-sm">
                    <thead>
                        <tr>
                            <th
                                class="border-b border-default bg-elevated px-4 py-3 text-left text-sm font-medium text-toned"
                            >
                                Invoice
                            </th>
                            <th
                                class="border-b border-default bg-elevated px-4 py-3 text-left text-sm font-medium text-toned"
                            >
                                Periode
                            </th>
                            <th
                                class="border-b border-default bg-elevated px-4 py-3 text-left text-sm font-medium text-toned"
                            >
                                Nominal
                            </th>
                            <th
                                class="border-b border-default bg-elevated px-4 py-3 text-left text-sm font-medium text-toned"
                            >
                                Status
                            </th>
                            <th
                                class="border-b border-default bg-elevated px-4 py-3 text-left text-sm font-medium text-toned"
                            >
                                Jatuh Tempo
                            </th>
                            <th
                                class="border-b border-default bg-elevated px-4 py-3 text-left text-sm font-medium text-toned"
                            >
                                Grace Period Berakhir
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
                            :key="item.id"
                            class="border-b border-default last:border-b-0"
                        >
                            <td class="px-4 py-3 font-semibold">
                                {{ item.invoice }}
                            </td>
                            <td class="px-4 py-3">
                                {{ item.period }}
                            </td>
                            <td class="px-4 py-3">
                                {{ formatCurrency(item.amount) }}
                            </td>
                            <td class="px-4 py-3">
                                <UBadge :color="statusColor(item.status)" variant="subtle">
                                    {{ item.status }}
                                </UBadge>
                            </td>
                            <td class="px-4 py-3">
                                {{ item.due_date }}
                            </td>
                            <td class="px-4 py-3">
                                {{ item.grace_period }}
                            </td>
                            <td class="px-4 py-3 text-right">
                                <UButton
                                    v-if="item.can_confirm"
                                    color="primary"
                                    size="sm"
                                    icon="lucide:check-check"
                                    @click="confirmPayment(item)"
                                >
                                    Konfirmasi Manual
                                </UButton>
                                <span v-else class="text-toned">-</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="space-y-3 md:hidden">
                <div
                    v-for="item in list"
                    :key="item.id"
                    class="rounded-lg border border-default p-3"
                >
                    <div class="flex items-center justify-between gap-2">
                        <strong>{{ item.invoice }} · {{ item.period }}</strong>
                        <UBadge :color="statusColor(item.status)" variant="subtle">
                            {{ item.status }}
                        </UBadge>
                    </div>
                    <div class="mt-2 text-xs text-toned">
                        {{ formatCurrency(item.amount) }} · jatuh tempo {{ item.due_date }}
                    </div>
                    <UButton
                        v-if="item.can_confirm"
                        color="primary"
                        size="sm"
                        class="mt-3 w-full justify-center"
                        @click="confirmPayment(item)"
                    >
                        Konfirmasi Manual
                    </UButton>
                </div>
                <UButton
                    color="neutral"
                    variant="outline"
                    class="w-full justify-center"
                >
                    Muat 11 invoice lainnya
                </UButton>
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
