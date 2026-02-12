<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const id = Number(route.params.id)

async function useDetail(id: number) {
    const statusColors = STATUS_COLORS
    const deleteConfirmation = ref(false)
    const { data } = await useFetch(`/api/tenant/${id}/detail`, {
        transform: res => ({
            ...res.data,
            joined_at: formatShortDate(res.data.joined_at || ''),
        }),
    })
    const tenant = computed<Tenant>(() => data.value ?? {} as Tenant)

    return {
        statusColors,
        deleteConfirmation,
        tenant,
    }
}

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

const {
    statusColors,
    deleteConfirmation,
    tenant,
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

                    <UButton
                        color="primary"
                        icon="lucide:pencil"
                        class="cursor-pointer"
                        :to="`/tenants/${tenant.tenant_id}/edit`"
                    >
                        Edit Tenant
                    </UButton>
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

        <UCard
            class="mb-8"
            :ui="{
                root: 'ring-error',
            }"
        >
            <template #header>
                <div class="flex justify-between items-center">
                    <h3 class="text-error">
                        Danger Zone
                    </h3>
                </div>
            </template>

            <section>
                <div class="mb-8">
                    <DetailSectionTitle title="Suspend" />
                    <p class="mb-2">
                        Suspend the tenant for a predetermined period, during which all services and access will be disabled
                    </p>
                    <UButton
                        color="error"
                        icon="lucide:ban"
                        class="cursor-pointer"
                    >
                        Suspend Tenant
                    </UButton>
                </div>

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
        </UCard>

        <UModal
            v-model:open="deleteConfirmation"
            title="Delete Confirmation"
            :ui="{ title: 'text-error', footer: 'justify-end' }"
        >
            <template #body>
                {{ `Are you sure you want to delete ${tenant.name}? This action cannot be undone` }}
            </template>

            <template #footer="{ close }">
                <UButton
                    label="Cancel"
                    color="neutral"
                    variant="outline"
                    @click="close"
                />
                <UButton
                    label="Submit"
                    color="error"
                    @click="deleteData(id)"
                />
            </template>
        </UModal>
    </div>
</template>
