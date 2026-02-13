<script setup lang="ts">
const route = useRoute()

async function useDashbaordListTenant() {
    const { data, pending } = await useFetch('/api/dashboard/tenant', {
        transform: res => res.data,
        query: { page: 1, limit: 5 },
    })
    const tenants = computed<Tenant[]>(() => data.value?.tenants ?? [])
    const total = 5

    return {
        tenants,
        total,
        pending,
    }
}

const {
    tenants,
    total,
    pending,
} = await useDashbaordListTenant()

useHead({
    title: 'Dashboard',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <div class="grid grid-cols-3 gap-4 mb-8">
            <CardTotal
                title="Total Tenants"
                :total="142"
                icon="lucide:building"
                with-stats
                stats="12%"
                stats-status="up"
                stats-text="vs last month"
            />

            <CardTotal
                title="Active Events"
                :total="84"
                icon="lucide:calendar"
                with-stats
                stats="5%"
                stats-status="equal"
                stats-text="vs last month"
            />

            <CardTotal
                title="Total Check-ins"
                :total="12500"
                icon="lucide:users"
                with-stats
                stats="25%"
                stats-status="down"
                stats-text="vs last month"
            />
        </div>

        <div>
            <UCard>
                <template #header>
                    <div class="flex justify-between items-center">
                        <h3>Tenant Management</h3>
                        <UButton
                            color="primary"
                            icon="lucide:plus"
                            class="cursor-pointer"
                            to="/tenants/add"
                        >
                            Add Tenant
                        </UButton>
                    </div>
                </template>

                <TableTenant
                    :data="tenants"
                    :total="total"
                    :pending="pending"
                />
            </UCard>
        </div>
    </div>
</template>
