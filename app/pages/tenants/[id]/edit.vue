<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.id)

async function useInfo(id: number) {
    const { data } = await useFetch(`/api/tenant/${id}`, {
        transform: res => ({
            name: res.data.name,
            status: res.data.status,
            owner_name: res.data.owner.name,
            owner_email: res.data.owner.email,
            owner_phone_number: res.data.owner.phone.number,
            plan_id: 1, // HARDCODE
        } as TenantForm),
    })
    const tenant = computed<TenantForm>(() => data.value ?? {} as TenantForm)

    return { tenant }
}

const { tenant } = await useInfo(id)

useHead({
    title: 'Tenant - Edit',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {
    [':id']: {
        param: route.params.id as string,
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
