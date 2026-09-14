<script setup lang="ts">
const route = useRoute()
const dateRange = ref('1 Agu – 13 Sep 2026')
const sortBy = ref('revenue')

const sortOptions = [
    { label: 'Revenue', value: 'revenue' },
    { label: 'Jumlah Event', value: 'events' },
    { label: 'Tiket Terjual', value: 'tickets' },
]

const tenantComparison = ref([
    { name: 'Nada Malam', tier: 'Enterprise', events: 48, tickets: 12400, revenue: 620000000, topPerformer: true },
    { name: 'Loka Festival', tier: 'Pro', events: 36, tickets: 9850, revenue: 410000000, topPerformer: false },
    { name: 'Studio Panggung', tier: 'Pro', events: 29, tickets: 7120, revenue: 298000000, topPerformer: false },
    { name: 'Panggung Rakyat', tier: 'Trial', events: 4, tickets: 310, revenue: 12000000, topPerformer: false },
])

function sortedTenants() {
    return [...tenantComparison.value].sort((a, b) => {
        if (sortBy.value === 'revenue') return b.revenue - a.revenue
        if (sortBy.value === 'events') return b.events - a.events
        return b.tickets - a.tickets
    })
}

function formatCurrency(val: number) {
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)}M`
    if (val >= 1000000) return `Rp ${Math.round(val / 1000000)}jt`
    return `Rp ${val.toLocaleString('id-ID')}`
}

function tierColor(tier: string) {
    switch (tier) {
        case 'Enterprise': return 'primary' as const
        case 'Pro': return 'success' as const
        case 'Trial': return 'warning' as const
        default: return 'neutral' as const
    }
}

useHead({
    title: 'Laporan Lintas Tenant',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-3 mb-6">
            <UInput
                v-model="dateRange"
                icon="lucide:calendar"
                placeholder="Rentang tanggal"
                class="w-60"
            />
            <USelect
                v-model="sortBy"
                :items="sortOptions"
                placeholder="Urutkan"
                class="w-48"
            />
        </div>

        <!-- Comparison Table -->
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <h3>Perbandingan Performa Antar Tenant</h3>
                    <UButton
                        icon="lucide:download"
                        color="neutral"
                        variant="outline"
                        size="sm"
                    >
                        Export
                    </UButton>
                </div>
            </template>

            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-neutral-200">
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Tenant
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Tier
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Jumlah Event
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Tiket Terjual
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Revenue
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="tenant in sortedTenants()"
                            :key="tenant.name"
                            class="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                        >
                            <td class="py-3 px-4">
                                <div class="flex items-center gap-2">
                                    <span class="font-medium">{{ tenant.name }}</span>
                                    <UBadge
                                        v-if="tenant.topPerformer"
                                        color="success"
                                        variant="subtle"
                                        size="xs"
                                    >
                                        Top performer
                                    </UBadge>
                                </div>
                            </td>
                            <td class="py-3 px-4">
                                <UBadge
                                    :color="tierColor(tenant.tier)"
                                    variant="subtle"
                                    size="xs"
                                >
                                    {{ tenant.tier }}
                                </UBadge>
                            </td>
                            <td class="py-3 px-4 tabular-nums">
                                {{ tenant.events }}
                            </td>
                            <td class="py-3 px-4 tabular-nums">
                                {{ tenant.tickets.toLocaleString('id-ID') }}
                            </td>
                            <td class="py-3 px-4 tabular-nums font-medium">
                                {{ formatCurrency(tenant.revenue) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </UCard>
    </div>
</template>
