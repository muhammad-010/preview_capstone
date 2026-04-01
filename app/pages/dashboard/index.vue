<script setup lang="ts">
const route = useRoute()

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
        <div class="grid grid-cols-3 gap-4 mb-8">
            <CardTotal
                title="Total Tenants"
                :total="totalTenant"
                icon="lucide:building"
            />

            <CardTotal
                title="Active Events"
                :total="84"
                icon="lucide:calendar"
            />

            <CardTotal
                title="Total Check-ins"
                :total="12500"
                icon="lucide:circle-check"
            />
        </div>

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
