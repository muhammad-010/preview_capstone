<script setup lang="ts">
const route = useRoute()

const tenantQuotas = ref([
    {
        name: 'Loka Festival',
        tier: 'Pro',
        events: { used: 42, limit: 50 },
        users: { used: 18, limit: 30 },
    },
    {
        name: 'Kopi Darat ID',
        tier: 'Basic',
        events: { used: 8, limit: 15 },
        users: { used: 10, limit: 10 },
    },
    {
        name: 'Nada Malam',
        tier: 'Enterprise',
        events: { used: 48, limit: -1 },
        users: { used: 35, limit: -1 },
    },
])

const selectedTenant = ref(0)
const overrideEventLimit = ref('')
const overrideUserLimit = ref('')
const blockOnQuotaReached = ref(true)

function usagePercent(used: number, limit: number) {
    if (limit <= 0) return 0
    return Math.round((used / limit) * 100)
}

function usageColor(percent: number) {
    if (percent >= 90) return 'error' as const
    if (percent >= 70) return 'warning' as const
    return 'success' as const
}

function displayLimit(limit: number) {
    return limit <= 0 ? 'Tanpa batas' : String(limit)
}

watch(selectedTenant, (idx) => {
    const t = tenantQuotas.value[idx]
    if (t) {
        overrideEventLimit.value = t.events.limit <= 0 ? '' : String(t.events.limit)
        overrideUserLimit.value = t.users.limit <= 0 ? '' : String(t.users.limit)
    }
}, { immediate: true })

useHead({
    title: 'Kuota Resource',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <!-- Tenant Selector -->
        <div class="mb-6">
            <USelect
                v-model="selectedTenant"
                :items="tenantQuotas.map((t, i) => ({ label: `${t.name} (${t.tier})`, value: i }))"
                placeholder="Pilih tenant"
                class="w-72"
            />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Quota Usage -->
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3>Kuota — {{ tenantQuotas[selectedTenant]?.name }}</h3>
                        <UBadge
                            color="success"
                            variant="subtle"
                        >
                            Tier {{ tenantQuotas[selectedTenant]?.tier }}
                        </UBadge>
                    </div>
                </template>

                <div class="space-y-6">
                    <!-- Event Quota -->
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span>Jumlah event</span>
                            <span class="tabular-nums font-medium">
                                {{ tenantQuotas[selectedTenant]?.events.used }}
                                / {{ displayLimit(tenantQuotas[selectedTenant]?.events.limit ?? 0) }}
                            </span>
                        </div>
                        <UProgress
                            v-if="tenantQuotas[selectedTenant]?.events.limit > 0"
                            :model-value="usagePercent(tenantQuotas[selectedTenant]?.events.used ?? 0, tenantQuotas[selectedTenant]?.events.limit ?? 1)"
                            :color="usageColor(usagePercent(tenantQuotas[selectedTenant]?.events.used ?? 0, tenantQuotas[selectedTenant]?.events.limit ?? 1))"
                        />
                        <div
                            v-else
                            class="h-2 rounded-full bg-neutral-100"
                        >
                            <div class="h-full rounded-full bg-success w-1/4" />
                        </div>
                        <small
                            v-if="tenantQuotas[selectedTenant]?.events.limit > 0"
                            class="text-neutral-400 mt-1 block"
                        >
                            {{ usagePercent(tenantQuotas[selectedTenant]?.events.used ?? 0, tenantQuotas[selectedTenant]?.events.limit ?? 1) }}% terpakai
                        </small>
                    </div>

                    <!-- User Quota -->
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span>Jumlah user (admin+member)</span>
                            <span class="tabular-nums font-medium">
                                {{ tenantQuotas[selectedTenant]?.users.used }}
                                / {{ displayLimit(tenantQuotas[selectedTenant]?.users.limit ?? 0) }}
                            </span>
                        </div>
                        <UProgress
                            v-if="tenantQuotas[selectedTenant]?.users.limit > 0"
                            :model-value="usagePercent(tenantQuotas[selectedTenant]?.users.used ?? 0, tenantQuotas[selectedTenant]?.users.limit ?? 1)"
                            :color="usageColor(usagePercent(tenantQuotas[selectedTenant]?.users.used ?? 0, tenantQuotas[selectedTenant]?.users.limit ?? 1))"
                        />
                        <div
                            v-else
                            class="h-2 rounded-full bg-neutral-100"
                        >
                            <div class="h-full rounded-full bg-success w-1/4" />
                        </div>
                    </div>

                    <!-- Full Quota Warning -->
                    <div
                        v-if="tenantQuotas[selectedTenant]?.users.limit > 0 && usagePercent(tenantQuotas[selectedTenant]?.users.used ?? 0, tenantQuotas[selectedTenant]?.users.limit ?? 1) >= 100"
                        class="rounded-lg border border-error bg-error/5 p-4"
                    >
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-error">
                                    Kuota seat sudah tercapai
                                </p>
                                <small class="text-error/75">
                                    Tidak bisa mengundang user baru sampai kuota ditambah atau di-upgrade.
                                </small>
                            </div>
                            <UButton
                                color="warning"
                                size="sm"
                            >
                                Upgrade tier
                            </UButton>
                        </div>
                    </div>
                </div>
            </UCard>

            <!-- Override Form -->
            <UCard>
                <template #header>
                    <h3>Override kuota manual</h3>
                </template>

                <div class="space-y-4">
                    <UFormField label="Batas jumlah event">
                        <UInput
                            v-model="overrideEventLimit"
                            placeholder="Kosongkan untuk pakai default tier"
                        />
                        <template #hint>
                            <span class="text-xs text-neutral-400">Kosongkan untuk pakai default tier</span>
                        </template>
                    </UFormField>

                    <UFormField label="Batas jumlah user">
                        <UInput
                            v-model="overrideUserLimit"
                            placeholder="Kosongkan untuk pakai default tier"
                        />
                    </UFormField>

                    <div class="flex items-center justify-between py-2">
                        <span class="text-sm">Blokir aksi saat kuota tercapai</span>
                        <UToggle v-model="blockOnQuotaReached" />
                    </div>

                    <UButton color="primary">
                        Simpan override
                    </UButton>
                </div>
            </UCard>
        </div>
    </div>
</template>
