<script setup lang="ts">
const { $api } = useNuxtApp()
const router = useRouter()
const route = useRoute()
const id = Number(route.params.tenant_id)
const toast = useToast()

async function useDetail(id: number) {
    const statusColors = STATUS_COLORS
    const { data, refresh } = await useApi(`/api/tenant/${id}/detail`, {
        transform: res => ({
            ...res.data,
            joined_at: formatShortDate(res.data.joined_at || ''),
        }),
    })
    const tenant = computed<Tenant>(() => data.value ?? {} as Tenant)

    return {
        statusColors,
        tenant,
        refresh,
    }
}

async function useDeleteData(id: number) {
    const deleteConfirmation = ref(false)
    const deleteLoading = ref(false)

    async function deleteData() {
        try {
            deleteLoading.value = true
            const data = await $api(`/api/tenant/${id}`, {
                method: 'DELETE',
            })
            if (data.success) {
                toast.add({
                    title: 'Success',
                    description: 'A tenant has been deleted',
                    color: 'success',
                })
                router.go(-1)
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to delete new tenant',
                color: 'error',
            })
            console.error('Delete tenant error', error)
        }
        finally {
            deleteLoading.value = false
        }
    }

    return {
        deleteConfirmation,
        deleteLoading,
        deleteData,
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
        statusColors,
        tenant,
        refresh,
    },

    {
        deleteLoading,
        deleteConfirmation,
        deleteData,
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
    useDeleteData(id),
    useActivateData(id),
    useDeactivateData(id),
])

useHead({
    title: `Tenant - ${tenant.value.name}`,
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

        <UCard class="mb-8">
            <template #header>
                <div class="flex justify-between items-center">
                    <h3>Detailed Information</h3>

                    <div class="flex items-center gap-2">
                        <UButton
                            v-if="tenant.status === STATUS_INACTIVE"
                            color="success"
                            variant="outline"
                            icon="lucide:check"
                            class="cursor-pointer"
                            @click="activateConfirmation = true"
                        >
                            Activate Tenant
                        </UButton>

                        <UButton
                            v-else
                            color="error"
                            variant="outline"
                            icon="lucide:ban"
                            class="cursor-pointer"
                            @click="deactivateConfirmation = true"
                        >
                            Deactivate Tenant
                        </UButton>

                        <UButton
                            color="primary"
                            icon="lucide:pencil"
                            class="cursor-pointer"
                            :to="`/tenants/${tenant.tenant_id}/edit`"
                        >
                            Edit Tenant
                        </UButton>
                    </div>
                </div>
            </template>

            <div>
                <section class="grid md:grid-cols-2 gap-6 mb-8">
                    <DetailSectionData
                        title="Name"
                        icon="lucide:user"
                        :subtitle="tenant.owner?.name || ''"
                    />

                    <DetailSectionData
                        title="Email"
                        icon="lucide:mail"
                        :subtitle="tenant.owner?.email || ''"
                    />

                    <DetailSectionData
                        title="Phone"
                        icon="lucide:phone"
                        :subtitle="tenant.owner?.phone.number || ''"
                    />

                    <DetailSectionData
                        title="Join Date"
                        icon="lucide:calendar"
                        :subtitle="tenant.joined_at || ''"
                    />

                    <DetailSectionData
                        title="Plan"
                        icon="lucide:building"
                        :subtitle="tenant.plan || ''"
                    />

                    <DetailSectionData title="Status">
                        <UBadge
                            :color="statusColors[tenant.status]"
                            variant="subtle"
                            :label="tenant.status"
                        />
                    </DetailSectionData>
                </section>
            </div>
        </UCard>

        <CardDangerZone>
            <section>
                <div>
                    <DetailSectionTitle title="Delete" />
                    <p class="mb-2">
                        Permanently delete this tenant and all associated data. This action cannot be undone
                    </p>
                    <UButton
                        color="error"
                        icon="lucide:trash"
                        class="cursor-pointer"
                        @click="deleteConfirmation = true"
                    >
                        Delete Tenant
                    </UButton>
                </div>
            </section>
        </CardDangerZone>

        <ModalConfirmNegativeAction
            v-model:open="deleteConfirmation"
            title="Delete Confirmation"
            :body="`Are you sure you want to delete ${tenant.name}? This action cannot be undone`"
            :loading="deleteLoading"
            @confirm="deleteData"
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
