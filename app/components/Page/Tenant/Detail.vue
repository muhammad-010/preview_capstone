<script setup lang="ts">
const statusColors = STATUS_COLORS

defineProps<{
    tenant: Tenant
}>()
const emit = defineEmits([EMIT_DETAIL_ACTIVATE, EMIT_DETAIL_DEACTIVATE, EMIT_DETAIL_DELETE])
</script>

<template>
    <UCard class="mb-8">
        <template #header>
            <div class="card-toolbar">
                <div class="card-toolbar-left">
                    <h3>Detailed Information</h3>
                </div>

                <div class="card-toolbar-actions">
                    <UButton
                        v-if="tenant.status === STATUS_INACTIVE"
                        color="success"
                        variant="outline"
                        icon="lucide:check"
                        class="cursor-pointer"
                        @click="emit(EMIT_DETAIL_ACTIVATE)"
                    >
                        Activate Tenant
                    </UButton>

                    <UButton
                        v-else
                        color="error"
                        variant="outline"
                        icon="lucide:ban"
                        class="cursor-pointer"
                        @click="emit(EMIT_DETAIL_DEACTIVATE)"
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
            <DetailSectionTitle title="Delete" />
            <p class="mb-2">
                Permanently delete this tenant and all associated data. This action cannot be undone
            </p>
            <UButton
                color="error"
                icon="lucide:trash"
                class="cursor-pointer"
                @click="emit(EMIT_DETAIL_DELETE)"
            >
                Delete Tenant
            </UButton>
        </section>
    </CardDangerZone>
</template>
