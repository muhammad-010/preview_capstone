<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.tenant_id)

async function useDetail(id: number) {
    const { data, refresh } = await useApi(`/api/tenant/${id}/detail`, {
        transform: res => ({
            ...res.data,
            joined_at: formatShortDate(res.data.joined_at || ''),
        }),
    })
    const tenant = computed<Tenant>(() => data.value ?? {} as Tenant)

    return {
        tenant,
        refresh,
    }
}

const {
    tenant,
    refresh,
} = await useDetail(id)

useHead({
    title: computed(() => `Tenant - ${tenant.value ? tenant.value.name : 'Detail'}`),
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {
    [':tenant_id']: {
        param: route.params.tenant_id as string,
        label: tenant.value.name,
    },
}))
</script>

<template>
    <div class="my-8">
        <div class="grid grid-cols-2 gap-4 mb-8">
            <CardTotal
                title="Total Events"
                :total="tenant.total_event ?? 0"
                icon="lucide:calendar"
            />

            <CardTotal
                title="Registered Users"
                :total="tenant.total_registered_user ?? 0"
                icon="lucide:users"
            />
        </div>

        <PageTenantDetail
            :tenant="tenant"
            @refresh="refresh"
        />
    </div>
</template>
