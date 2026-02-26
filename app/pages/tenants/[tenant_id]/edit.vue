<script setup lang="ts">
const route = useRoute()
const tenantId = Number(route.params.tenant_id)
const { tenant } = await useTenantInfo(tenantId)

useHead({
    title: 'Tenant - Edit',
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
        <FormTenant
            :id="tenantId"
            :fields="tenant"
        />
    </div>
</template>
