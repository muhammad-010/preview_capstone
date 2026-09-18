<script setup lang="ts">
const route = useRoute()

const seatLimits = ref([
    { tier: 'Basic', maxAdmin: 2, maxMember: 10, since: 'Default' },
    { tier: 'Pro', maxAdmin: 5, maxMember: 30, since: 'Default' },
    { tier: 'Enterprise', maxAdmin: -1, maxMember: -1, since: 'Default' },
])

const editingDefaults = ref(false)

function getTodayStr() {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yy = String(today.getFullYear()).slice(-2)
    return `${dd}/${mm}/${yy}`
}

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
                                    :model-value="limit.maxAdmin"
                                    @update:model-value="(val) => {
                                        limit.maxAdmin = Number(val)
                                        limit.since = getTodayStr()
                                    }"
                                    type="number"
                                    class="w-24"
                                    size="sm"
                                />
                                <span v-else>{{ displayLimit(limit.maxAdmin) }}</span>
                            </td>
                            <td class="py-3 px-4 tabular-nums">
                                <UInput
                                    v-if="editingDefaults && limit.maxMember > 0"
                                    :model-value="limit.maxMember"
                                    @update:model-value="(val) => {
                                        limit.maxMember = Number(val)
                                        limit.since = getTodayStr()
                                    }"
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

    </div>
</template>
