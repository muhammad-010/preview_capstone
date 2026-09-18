<script setup lang="ts">
const route = useRoute()
const activePeriod = ref('Bulanan')
const periods = ['Mingguan', 'Bulanan', 'Kuartalan']

// Mock data for chart
const chartMonths = ['Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep']
const eventsCreated = [54, 74, 65, 84, 94, 78, 101, 89, 108, 97, 119, 128]
const tenantsNew = [8, 12, 10, 15, 14, 18, 16, 21, 19, 24, 27, 31]

// Mock inactive tenants data
const inactiveTenants = ref([
    { name: 'Loka Festival', tier: 'Pro', lastEvent: '34 hari lalu', status: 'Menurun' },
    { name: 'Kopi Darat ID', tier: 'Basic', lastEvent: '41 hari lalu', status: 'Menurun' },
    { name: 'Studio Panggung', tier: 'Pro', lastEvent: '30 hari lalu', status: 'Mulai menurun' },
    { name: 'Nada Malam', tier: 'Enterprise', lastEvent: '38 hari lalu', status: 'Menurun' },
])

const maxValue = computed(() => Math.max(...eventsCreated))

useHead({
    title: 'Tren Pertumbuhan',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <!-- Period Tabs + Export -->
        <div class="flex items-center justify-between mb-6">
            <UTabs
                :items="periods.map(p => ({ label: p, value: p }))"
                :model-value="activePeriod"
                @update:model-value="activePeriod = String($event)"
            />
            <UButton
                icon="lucide:download"
                color="neutral"
                variant="outline"
                size="sm"
            >
                Export grafik
            </UButton>
        </div>

        <!-- Chart Card -->
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <h3>Tren tenant baru & event dibuat</h3>
                    <small class="text-neutral-500">12 bulan terakhir</small>
                </div>
            </template>

            <!-- Simple Bar Chart -->
            <div class="px-2">
                <div class="flex items-end gap-2 h-48 mb-4">
                    <div
                        v-for="(value, index) in eventsCreated"
                        :key="index"
                        class="flex-1 flex flex-col items-center gap-1"
                    >
                        <small class="text-xs text-neutral-400 tabular-nums">
                            {{ value }}
                        </small>
                        <div
                            class="w-full rounded-t-md bg-primary-100 transition-all duration-500"
                            :style="{ height: `${(value / maxValue) * 100}%` }"
                        />
                        <small class="text-xs text-neutral-500">
                            {{ chartMonths[index] }}
                        </small>
                    </div>
                </div>

                <!-- Legend -->
                <div class="flex gap-6 text-xs text-neutral-500 mt-2 border-t border-neutral-200 pt-3">
                    <span class="flex items-center gap-2">
                        <span class="inline-block w-3 h-3 rounded-sm bg-primary-100" />
                        Event dibuat
                    </span>
                    <span class="flex items-center gap-2">
                        <span class="inline-block w-3 h-3 rounded-full bg-success" />
                        Tenant baru: {{ tenantsNew.reduce((a, b) => a + b, 0) }} total
                    </span>
                </div>
            </div>
        </UCard>

        <USeparator class="my-6" />

        <!-- Inactive Tenants Table -->
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <h3>Tenant terindikasi tidak aktif</h3>
                    <UBadge
                        color="error"
                        variant="subtle"
                    >
                        {{ inactiveTenants.length }} tenant
                    </UBadge>
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
                                Event terakhir dibuat
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Status aktivitas
                            </th>
                            <th class="py-3 px-4" />
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="tenant in inactiveTenants"
                            :key="tenant.name"
                            class="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                        >
                            <td class="py-3 px-4 font-medium">
                                {{ tenant.name }}
                            </td>
                            <td class="py-3 px-4">
                                {{ tenant.tier }}
                            </td>
                            <td class="py-3 px-4 text-neutral-500">
                                {{ tenant.lastEvent }}
                            </td>
                            <td class="py-3 px-4">
                                <UBadge
                                    :color="tenant.status === 'Menurun' ? 'error' : 'warning'"
                                    variant="subtle"
                                >
                                    {{ tenant.status }}
                                </UBadge>
                            </td>
                            <td class="py-3 px-4 text-right">
                                <UButton
                                    color="neutral"
                                    variant="ghost"
                                    size="xs"
                                >
                                    Lihat detail
                                </UButton>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </UCard>
    </div>
</template>
