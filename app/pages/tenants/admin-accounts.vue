<script setup lang="ts">
const route = useRoute()

const selectedTenant = ref('Loka Festival')
const tenantOptions = ['Loka Festival', 'Kopi Darat ID', 'Studio Panggung', 'Nada Malam']

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

const currentAccounts = computed(() => adminAccounts.value[selectedTenant.value] || [])

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
            <USelect
                v-model="selectedTenant"
                :items="tenantOptions.map(t => ({ label: t, value: t }))"
                placeholder="Pilih tenant"
                class="w-64"
            />
            <UBadge
                color="success"
                variant="subtle"
            >
                Tenant tetap aktif
            </UBadge>
        </div>

        <!-- Admin Accounts Table -->
        <UCard>
            <template #header>
                <h3>{{ selectedTenant }} — Akun Tenant.admin</h3>
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
                            v-for="account in currentAccounts"
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
