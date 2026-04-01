<script setup lang="ts">
const { $api } = useNuxtApp()
const route = useRoute()
const id = Number(route.params.tenant_id)
const toast = useToast()

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

async function useActivateData(id: number) {
    const activateConfirmation = ref(false)
    const activateLoading = ref(false)

    async function activateData() {
        try {
            activateLoading.value = true
            const data = await $api(`/api/tenant/${id}/status`, {
                method: 'PATCH',
                body: {
                    status: STATUS_ACTIVE,
                } as ActivateDeactivate,
            })
            if (data.success) {
                activateConfirmation.value = false
                toast.add({
                    title: 'Success',
                    description: 'A tenant has been activated',
                    color: 'success',
                })
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to activate new tenant',
                color: 'error',
            })
            console.error('Activate tenant error', error)
        }
        finally {
            activateLoading.value = false
        }
    }

    return {
        activateConfirmation,
        activateLoading,
        activateData,
    }
}

async function useDeactivateData(id: number) {
    const deactivateConfirmation = ref(false)
    const deactivateLoading = ref(false)

    async function deactivateData() {
        try {
            deactivateLoading.value = true
            const data = await $api(`/api/tenant/${id}/status`, {
                method: 'PATCH',
                body: {
                    status: STATUS_INACTIVE,
                } as ActivateDeactivate,
            })
            if (data.success) {
                deactivateConfirmation.value = false
                toast.add({
                    title: 'Success',
                    description: 'A tenant has been deactivated',
                    color: 'success',
                })
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to deactivate new tenant',
                color: 'error',
            })
            console.error('Deactivate tenant error', error)
        }
        finally {
            deactivateLoading.value = false
        }
    }

    return {
        deactivateConfirmation,
        deactivateLoading,
        deactivateData,
    }
}

const [
    {
        tenant,
        refresh,
    },

    {
        activateLoading,
        activateConfirmation,
        activateData,
    },

    {
        deactivateLoading,
        deactivateConfirmation,
        deactivateData,
    },
] = await Promise.all([
    useDetail(id),
    useActivateData(id),
    useDeactivateData(id),
])

useHead({
    title: computed(() => `Tenant - ${tenant.value ? tenant.value.name : 'Detail'}`),
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {
    [':tenant_id']: {
        param: route.params.tenant_id as string,
        label: tenant.value.name,
    },
}))

async function activateTenant() {
    await activateData()
    await refresh()
}

async function deactivateTenant() {
    await deactivateData()
    await refresh()
}
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
            @activate="activateConfirmation = true"
            @deactivate="deactivateConfirmation = true"
        />

        <ModalConfirmNegativeAction
            v-model:open="deactivateConfirmation"
            title="Deactivate Confirmation"
            :body="`Are you sure you want to deactivate ${tenant.name}? All services and access will be disabled for this tenant`"
            :loading="deactivateLoading"
            @confirm="deactivateTenant"
        />

        <ModalConfirmPositiveAction
            v-model:open="activateConfirmation"
            title="Activate Confirmation"
            :body="`Are you sure you want to activate ${tenant.name}? All services and access will be enabled for this tenant`"
            :loading="activateLoading"
            @confirm="activateTenant"
        />
    </div>
</template>
