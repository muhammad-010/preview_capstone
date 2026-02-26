<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.tenant_id)

async function useInfo(id: number) {
    const { data } = await useFetch(`/api/tenant/${id}`, {
        transform: res => res.data,
    })
    const tenant = computed<TenantForm>(() => data.value ?? {} as TenantForm)

    return { tenant }
}

const { tenant } = await useInfo(id)

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
            :id="id"
            :fields="tenant"
        />
    </div>
</template>
