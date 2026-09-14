<script setup lang="ts">
const route = useRoute()

const seatLimits = ref([
    { tier: 'Basic', maxAdmin: 2, maxMember: 10, since: 'Release 1' },
    { tier: 'Pro', maxAdmin: 5, maxMember: 30, since: 'Release 1' },
    { tier: 'Enterprise', maxAdmin: -1, maxMember: -1, since: 'Release 1' },
])

// Example enforcement
const exampleTenant = ref({
    name: 'Kopi Darat ID',
    tier: 'Basic',
    memberUsed: 10,
    memberLimit: 10,
})

const editingDefaults = ref(false)

function displayLimit(val: number) {
    return val <= 0 ? 'Tanpa batas' : String(val)
}

useHead({
    title: 'Batas Seat',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <!-- Seat Limits Per Tier -->
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <h3>Batas seat per tier plan (default)</h3>
                    <UButton
                        color="neutral"
                        variant="outline"
                        size="sm"
                        icon="lucide:pencil"
                        @click="editingDefaults = !editingDefaults"
                    >
                        {{ editingDefaults ? 'Selesai' : 'Ubah default' }}
                    </UButton>
                </div>
            </template>

            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-neutral-200">
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Tier
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Maks. tenant.admin
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Maks. tenant.member
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Berlaku sejak
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="limit in seatLimits"
                            :key="limit.tier"
                            class="border-b border-neutral-100"
                        >
                            <td class="py-3 px-4 font-medium">
                                {{ limit.tier }}
                            </td>
                            <td class="py-3 px-4 tabular-nums">
                                <UInput
                                    v-if="editingDefaults && limit.maxAdmin > 0"
                                    v-model.number="limit.maxAdmin"
                                    type="number"
                                    class="w-24"
                                    size="sm"
                                />
                                <span v-else>{{ displayLimit(limit.maxAdmin) }}</span>
                            </td>
                            <td class="py-3 px-4 tabular-nums">
                                <UInput
                                    v-if="editingDefaults && limit.maxMember > 0"
                                    v-model.number="limit.maxMember"
                                    type="number"
                                    class="w-24"
                                    size="sm"
                                />
                                <span v-else>{{ displayLimit(limit.maxMember) }}</span>
                            </td>
                            <td class="py-3 px-4 text-neutral-500">
                                {{ limit.since }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <template
                v-if="editingDefaults"
                #footer
            >
                <div class="flex justify-end">
                    <UButton color="primary">
                        Simpan perubahan
                    </UButton>
                </div>
            </template>
        </UCard>

        <USeparator class="my-6" />

        <!-- Enforcement Example -->
        <UCard>
            <template #header>
                <h3>Contoh enforcement — {{ exampleTenant.name }} ({{ exampleTenant.tier }})</h3>
            </template>

            <div>
                <div class="flex justify-between text-sm mb-2">
                    <span>Seat tenant.member terpakai</span>
                    <span class="tabular-nums font-medium">
                        {{ exampleTenant.memberUsed }} / {{ exampleTenant.memberLimit }}
                    </span>
                </div>

                <UProgress
                    :model-value="(exampleTenant.memberUsed / exampleTenant.memberLimit) * 100"
                    color="error"
                    class="mb-4"
                />

                <div class="rounded-lg border border-error bg-error/5 p-4">
                    <div class="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p class="text-sm font-semibold text-error">
                                Gagal mengundang user baru.
                            </p>
                            <small class="text-error/75">
                                Kuota seat tenant.member plan {{ exampleTenant.tier }}
                                ({{ exampleTenant.memberLimit }}) sudah tercapai.
                            </small>
                        </div>
                        <UButton
                            color="warning"
                            size="sm"
                        >
                            Upgrade ke Pro
                        </UButton>
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>
