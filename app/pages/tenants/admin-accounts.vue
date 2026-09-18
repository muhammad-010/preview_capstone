<script setup lang="ts">
const route = useRoute()

const selectedTenant = ref('Loka Festival')
const tenantOptions = [
    { label: 'Loka Festival', value: 'Loka Festival' },
    { label: 'Kopi Darat ID', value: 'Kopi Darat ID' },
    { label: 'Studio Panggung', value: 'Studio Panggung' },
    { label: 'Nada Malam', value: 'Nada Malam' },
]

const searchTenant = (q: string) => {
    if (!q) return tenantOptions
    return tenantOptions.filter(tenant => tenant.label.toLowerCase().includes(q.toLowerCase()))
}
const adminAccounts = ref<Record<string, Array<{ name: string, email: string, role: string, status: 'active' | 'inactive' }>>>({
    'Loka Festival': [
        { name: 'Dewi Anjani', email: 'dewi@lokafestival.id', role: 'tenant.admin', status: 'active' },
        { name: 'Bagas Wirawan', email: 'bagas@lokafestival.id', role: 'tenant.admin', status: 'inactive' },
        { name: 'Sinta Puri', email: 'sinta@lokafestival.id', role: 'tenant.admin', status: 'active' },
    ],
    'Kopi Darat ID': [
        { name: 'Raka Mahendra', email: 'raka@kopidarat.id', role: 'tenant.admin', status: 'active' },
    ],
    'Studio Panggung': [
        { name: 'Lina Hartono', email: 'lina@studiopanggung.id', role: 'tenant.admin', status: 'active' },
        { name: 'Budi Prasetyo', email: 'budi@studiopanggung.id', role: 'tenant.admin', status: 'active' },
    ],
    'Nada Malam': [
        { name: 'Andi Saputra', email: 'andi@nadamalam.id', role: 'tenant.admin', status: 'active' },
    ],
})

const searchQuery = ref('')
const page = ref(1)
const limit = ref(5)

const filteredAccounts = computed(() => {
    const raw = adminAccounts.value[selectedTenant.value] || []
    if (!searchQuery.value) return raw
    const q = searchQuery.value.toLowerCase()
    return raw.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
})

const paginatedAccounts = computed(() => {
    const start = (page.value - 1) * limit.value
    return filteredAccounts.value.slice(start, start + limit.value)
})

watch(selectedTenant, () => {
    searchQuery.value = ''
    page.value = 1
})

watch(searchQuery, () => {
    page.value = 1
})
const deactivateTarget = ref<{ name: string, email: string } | null>(null)
const showDeactivateModal = ref(false)
const reactivateTarget = ref<{ name: string, email: string } | null>(null)
const showReactivateModal = ref(false)

function openDeactivate(account: { name: string, email: string }) {
    deactivateTarget.value = account
    showDeactivateModal.value = true
}

function confirmDeactivate() {
    if (deactivateTarget.value) {
        const accounts = adminAccounts.value[selectedTenant.value]
        if (accounts) {
            const acc = accounts.find(a => a.email === deactivateTarget.value!.email)
            if (acc) acc.status = 'inactive'
        }
    }
    showDeactivateModal.value = false
    deactivateTarget.value = null
}

function openReactivate(account: { name: string, email: string }) {
    reactivateTarget.value = account
    showReactivateModal.value = true
}

function confirmReactivate() {
    if (reactivateTarget.value) {
        const accounts = adminAccounts.value[selectedTenant.value]
        if (accounts) {
            const acc = accounts.find(a => a.email === reactivateTarget.value!.email)
            if (acc) acc.status = 'active'
        }
    }
    showReactivateModal.value = false
    reactivateTarget.value = null
}

useHead({
    title: 'Akun Tenant Admin',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <!-- Tenant Selector -->
        <div class="flex items-center gap-4 mb-6">
            <USelectMenu
                v-model="selectedTenant"
                :searchable="searchTenant"
                value-attribute="value"
                option-attribute="label"
                searchable-placeholder="Cari tenant..."
                placeholder="Pilih tenant"
                class="w-64"
            >
                <template #label>
                    {{ selectedTenant || 'Pilih tenant' }}
                </template>
            </USelectMenu>
        </div>

        <!-- Admin Accounts Table -->
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <h3>{{ selectedTenant }} — Akun Tenant.admin</h3>
                    <DataTableSearch
                        v-model="searchQuery"
                        class="w-64"
                    />
                </div>
            </template>

            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-neutral-200">
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Nama
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th class="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Status akun
                            </th>
                            <th class="py-3 px-4" />
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="account in paginatedAccounts"
                            :key="account.email"
                            class="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                        >
                            <td class="py-3 px-4 font-medium">
                                {{ account.name }}
                            </td>
                            <td class="py-3 px-4 text-neutral-500">
                                {{ account.email }}
                            </td>
                            <td class="py-3 px-4">
                                <UBadge
                                    color="neutral"
                                    variant="subtle"
                                    size="xs"
                                >
                                    {{ account.role }}
                                </UBadge>
                            </td>
                            <td class="py-3 px-4">
                                <UBadge
                                    :color="account.status === 'active' ? 'success' : 'neutral'"
                                    variant="subtle"
                                >
                                    {{ account.status === 'active' ? 'Aktif' : 'Nonaktif' }}
                                </UBadge>
                            </td>
                            <td class="py-3 px-4 text-right">
                                <UButton
                                    v-if="account.status === 'active'"
                                    color="error"
                                    variant="outline"
                                    size="xs"
                                    @click="openDeactivate(account)"
                                >
                                    Nonaktifkan
                                </UButton>
                                <UButton
                                    v-else
                                    color="neutral"
                                    variant="outline"
                                    size="xs"
                                    @click="openReactivate(account)"
                                >
                                    Aktifkan kembali
                                </UButton>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <template v-if="filteredAccounts.length > 0">
                <DataTablePagination
                    v-model:page="page"
                    v-model:limit="limit"
                    :total="filteredAccounts.length"
                    class="pb-4"
                />
            </template>
        </UCard>

        <!-- Deactivation Info -->
        <UCard class="mt-6 max-w-lg">
            <div class="text-sm text-neutral-500 space-y-1">
                <p class="font-semibold text-neutral-700">
                    Info: Efek nonaktifkan akun tenant.admin
                </p>
                <ul class="list-disc pl-5 space-y-1">
                    <li>Akun langsung ter-logout & tidak bisa login lagi</li>
                    <li>Tenant.admin lain di tenant yang sama tidak terpengaruh</li>
                    <li>Tenant tetap berjalan normal</li>
                </ul>
            </div>
        </UCard>

        <!-- Deactivate Modal -->
        <ModalConfirmNegativeAction
            v-model:open="showDeactivateModal"
            :title="`Nonaktifkan akun ${deactivateTarget?.name || ''}`"
            :body="`Anda akan menonaktifkan akun ${deactivateTarget?.name} (${deactivateTarget?.email}). Akun ini akan langsung ter-logout dan tidak bisa login lagi.`"
            confirm-label="Ya, nonaktifkan"
            @confirm="confirmDeactivate"
        />

        <!-- Reactivate Modal -->
        <ModalConfirmPositiveAction
            v-model:open="showReactivateModal"
            :title="`Aktifkan kembali ${reactivateTarget?.name || ''}`"
            :body="`Anda akan mengaktifkan kembali akun ${reactivateTarget?.name} (${reactivateTarget?.email}). Akun ini akan bisa login kembali.`"
            confirm-label="Ya, aktifkan kembali"
            @confirm="confirmReactivate"
        />
    </div>
</template>
