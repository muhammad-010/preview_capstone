<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const id = Number(route.params.id)

async function useDetail(id: number) {
    const statusColors = STATUS_COLORS
    const deleteConfirmation = ref(false)
    const activateConfirmation = ref(false)
    const deactivateConfirmation = ref(false)
    const { data, refresh } = await useFetch(`/api/tenant/${id}/detail`, {
        transform: res => ({
            ...res.data,
            joined_at: formatShortDate(res.data.joined_at || ''),
        }),
    })
    const tenant = computed<Tenant>(() => data.value ?? {} as Tenant)

    async function deleteData(id: number) {
        try {
            const data = await $fetch(`/api/tenant/${id}`, {
                method: 'DELETE',
            })
            if (data.success) {
                router.go(-1)
            }
        }
        catch (error) {
            console.error('Delete tenant error', error)
        }
    }

    async function activateData(id: number) {
        try {
            const data = await $fetch(`/api/tenant/${id}/status`, {
                method: 'PATCH',
                body: {
                    status: STATUS_ACTIVE,
                } as ActivateDeactivate,
            })
            if (data.success) {
                activateConfirmation.value = false
                refresh()
            }
        }
        catch (error) {
            console.error('Activate tenant error', error)
        }
    }

    async function deactivateData(id: number) {
        try {
            const data = await $fetch(`/api/tenant/${id}/status`, {
                method: 'PATCH',
                body: {
                    status: STATUS_INACTIVE,
                } as ActivateDeactivate,
            })
            if (data.success) {
                deactivateConfirmation.value = false
                refresh()
            }
        }
        catch (error) {
            console.error('Deactivate tenant error', error)
        }
    }

    return {
        statusColors,
        deleteConfirmation,
        activateConfirmation,
        deactivateConfirmation,
        tenant,
        refresh,
        deleteData,
        activateData,
        deactivateData,
    }
}

const {
    statusColors,
    deleteConfirmation,
    activateConfirmation,
    deactivateConfirmation,
    tenant,
    deleteData,
    activateData,
    deactivateData,
} = await useDetail(id)

useHead({
    title: `Tenant - ${tenant.value.name}`,
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
            @confirm="deleteData(id)"
        />

        <ModalConfirmNegativeAction
            v-model:open="deactivateConfirmation"
            title="Deactivate Confirmation"
            :body="`Are you sure you want to deactivate ${tenant.name}? All services and access will be disabled for this tenant`"
            @confirm="deactivateData(id)"
        />

        <ModalConfirmPositiveAction
            v-model:open="activateConfirmation"
            title="Activate Confirmation"
            :body="`Are you sure you want to activate ${tenant.name}? All services and access will be enabled for this tenant`"
            @confirm="activateData(id)"
        />
    </div>
</template>
