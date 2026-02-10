<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.id)

const tenant = DUMMY_TENANTS.filter(e => e.id === id)[0] ?? {
    id: 0,
    tenantName: '',
    status: 'inactive',
}
useHead({
    title: 'Tenant - Edit',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {
    [':id']: {
        param: route.params.id as string,
        label: tenant.tenantName,
    },
}))
</script>

<template>
    <div class="my-8">
        <FormTenant :fields="tenant" />
    </div>
</template>
