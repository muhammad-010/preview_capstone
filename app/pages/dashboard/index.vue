<script setup lang="ts">
const route = useRoute()

// Mock live stats data
const lastRefresh = ref(new Date())
const autoRefresh = ref(true)
const refreshInterval = ref<ReturnType<typeof setInterval> | null>(null)

const liveStats = ref({
    activeEvents: 1284,
    checkInsToday: 58940,
    activeTenants: 296,
    totalTenants: 312,
    revenue: 418000000,
})

function refreshData() {
    lastRefresh.value = new Date()
}

function formatTimeSince(date: Date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds} detik lalu`
    const minutes = Math.floor(seconds / 60)
    return `${minutes} menit lalu`
}

const timeSince = ref(formatTimeSince(lastRefresh.value))

onMounted(() => {
    setInterval(() => {
        timeSince.value = formatTimeSince(lastRefresh.value)
    }, 10000)

    if (autoRefresh.value) {
        refreshInterval.value = setInterval(refreshData, 300000)
    }
})

watch(autoRefresh, (val) => {
    if (val) {
        refreshInterval.value = setInterval(refreshData, 300000)
    }
    else if (refreshInterval.value) {
        clearInterval(refreshInterval.value)
        refreshInterval.value = null
    }
})

onUnmounted(() => {
    if (refreshInterval.value) {
        clearInterval(refreshInterval.value)
    }
})

// Existing dashboard data
async function useDashboardCardTotalTenant() {
    const { data } = await useApi('/api/dashboard/total-tenant', {
        transform: res => res.data,
    })
    const totalTenant = computed<number>(() => data.value?.count || 0)

    return { totalTenant }
}

async function useDashboardListTenant() {
    const { data } = await useApi('/api/dashboard/tenant', {
        transform: res => res.data,
    })
    const tenants = computed<Tenant[]>(() => data.value?.tenants ?? [])
    const total = 5

    return { tenants, total }
}

const { totalTenant } = await useDashboardCardTotalTenant()
const { tenants, total } = await useDashboardListTenant()

useHead({
    title: 'Dashboard',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <!-- Live indicator bar -->
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2 text-sm text-neutral-500">
                <span class="relative flex size-2.5">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span class="relative inline-flex size-2.5 rounded-full bg-success" />
                </span>
                Data live · terakhir diperbarui {{ timeSince }}
            </div>
            <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                    <small class="text-neutral-500">Auto-refresh</small>
                    <UToggle v-model="autoRefresh" />
                </div>
                <UButton
                    icon="lucide:refresh-cw"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    @click="refreshData"
                >
                    Refresh
                </UButton>
            </div>
        </div>

        <!-- Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <CardTotal
                title="Event Aktif"
                :total="liveStats.activeEvents"
                icon="lucide:calendar-check"
                icon-color="primary"
                with-stats
                stats="4.2%"
                stats-status="up"
                stats-text="vs minggu lalu"
            />

            <CardTotal
                title="Check-in Hari Ini"
                :total="liveStats.checkInsToday"
                icon="lucide:scan-line"
                icon-color="success"
                with-stats
                stats="12%"
                stats-status="up"
                stats-text="dari kemarin"
            />

            <CardTotal
                title="Tenant Aktif"
                :total="`${liveStats.activeTenants} / ${liveStats.totalTenants}`"
                icon="lucide:building"
                icon-color="warning"
                with-stats
                stats="3 tenant"
                stats-status="down"
                stats-text="menunggak"
                stats-text-status="down"
            />

            <CardTotal
                title="Revenue Bulan Ini"
                :total="liveStats.revenue"
                format-number="currency"
                icon="lucide:wallet"
                icon-color="success"
                with-stats
                stats="7.8%"
                stats-status="up"
                stats-text="MoM"
            />
        </div>

        <!-- Quick Navigation Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <UCard>
                <div class="flex items-center justify-between">
                    <div>
                        <h5 class="flex items-center gap-2">
                            <UIcon
                                name="lucide:trending-up"
                                class="size-5 text-primary"
                            />
                            Tren Pertumbuhan
                        </h5>
                        <small class="text-neutral-500">
                            Lihat tren pertumbuhan tenant dan event dalam periode tertentu
                        </small>
                    </div>
                    <UButton
                        color="primary"
                        variant="soft"
                        to="/dashboard/growth-trend"
                        trailing-icon="lucide:arrow-right"
                    >
                        Lihat
                    </UButton>
                </div>
            </UCard>

            <UCard>
                <div class="flex items-center justify-between">
                    <div>
                        <h5 class="flex items-center gap-2">
                            <UIcon
                                name="lucide:bar-chart-3"
                                class="size-5 text-primary"
                            />
                            Perbandingan Tenant
                        </h5>
                        <small class="text-neutral-500">
                            Bandingkan performa antar tenant (event, tiket, revenue)
                        </small>
                    </div>
                    <UButton
                        color="primary"
                        variant="soft"
                        to="/dashboard/reports"
                        trailing-icon="lucide:arrow-right"
                    >
                        Lihat
                    </UButton>
                </div>
            </UCard>
        </div>

        <!-- Tenant Management Table -->
        <div>
            <UCard>
                <template #header>
                    <div class="card-toolbar">
                        <div class="card-toolbar-left">
                            <h3>Tenant Management</h3>
                        </div>

                        <div class="card-toolbar-actions">
                            <UButton
                                color="primary"
                                icon="lucide:plus"
                                class="cursor-pointer"
                                to="/tenants/add"
                            >
                                Add Tenant
                            </UButton>
                        </div>
                    </div>
                </template>

                <PageTenantTable
                    :data="tenants"
                    :total="total"
                />
            </UCard>
        </div>
    </div>
</template>
