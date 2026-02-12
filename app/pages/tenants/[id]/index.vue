<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.id)
const statusColors = STATUS_COLORS

const tenant = DUMMY_TENANTS.filter(e => e.id === id)[0] ?? {
    id: 0,
    tenantName: '',
    status: 'inactive' as Status,
} as DummyTenant
useHead({
    title: `Tenant - ${tenant.tenantName}`,
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
        <div class="grid grid-cols-2 gap-4 mb-8">
            <CardTotal
                title="Total Events"
                :total="tenant.events ?? 0"
                icon="lucide:calendar"
            />

            <CardTotal
                title="Registered Users"
                :total="tenant.registeredUsers ?? 0"
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
                        :to="`/tenants/${tenant.id}/edit`"
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
                        :subtitle="tenant.adminName || ''"
                    />

                    <DetailSectionData
                        title="Email"
                        icon="lucide:mail"
                        :subtitle="tenant.adminEmail || ''"
                    />

                    <DetailSectionData
                        title="Phone"
                        icon="lucide:phone"
                        :subtitle="tenant.adminPhone || ''"
                    />

                    <DetailSectionData
                        title="Join Date"
                        icon="lucide:calendar"
                        :subtitle="tenant.createdAt || ''"
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

                    <DetailSectionData
                        title="Billing Address"
                        icon="lucide:map-pin"
                        :subtitle="tenant.billingAddress || ''"
                    />
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
                        :to="`tenants/${tenant.id}/edit`"
                    >
                        Delete Tenant
                    </UButton>
                </div>
            </section>
        </UCard>
    </div>
</template>
