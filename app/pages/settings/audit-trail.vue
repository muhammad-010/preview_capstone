<script setup lang="ts">
const route = useRoute()

const filterTenant = ref('all')
const filterType = ref('all')
const filterDateRange = ref('')

const tenantOptions = [
    { label: 'Semua Tenant', value: 'all' },
    { label: 'Kopi Darat ID', value: 'kopi-darat' },
    { label: 'Studio Panggung', value: 'studio-panggung' },
    { label: 'Loka Festival', value: 'loka-festival' },
    { label: 'Nada Malam', value: 'nada-malam' },
]

const typeOptions = [
    { label: 'Semua Jenis', value: 'all' },
    { label: 'Perubahan status', value: 'status' },
    { label: 'Perubahan tier', value: 'plan' },
    { label: 'Penghapusan', value: 'delete' },
]

interface AuditEntry {
    id: number
    actor: string
    actorType: 'superadmin' | 'system'
    action: string
    tenant: string
    changeType: 'status' | 'plan' | 'delete'
    from?: string
    to?: string
    reason?: string
    timestamp: string
}

const auditLog = ref<AuditEntry[]>([
    {
        id: 1,
        actor: 'Rayendra',
        actorType: 'superadmin',
        action: 'mengubah status tenant',
        tenant: 'Kopi Darat ID',
        changeType: 'status',
        from: 'Aktif',
        to: 'Ditangguhkan',
        timestamp: '13 Sep 2026, 09:12 WIB · manual override',
    },
    {
        id: 2,
        actor: 'Sistem',
        actorType: 'system',
        action: 'mengubah tier plan',
        tenant: 'Studio Panggung',
        changeType: 'plan',
        from: 'Basic',
        to: 'Pro',
        timestamp: '12 Sep 2026, 21:40 WIB · upgrade dari billing',
    },
    {
        id: 3,
        actor: 'Rayendra',
        actorType: 'superadmin',
        action: 'menghapus tenant',
        tenant: 'Uji Coba Internal',
        changeType: 'delete',
        reason: 'data uji coba',
        timestamp: '11 Sep 2026, 15:02 WIB · alasan: data uji coba',
    },
    {
        id: 4,
        actor: 'Sistem',
        actorType: 'system',
        action: 'mengubah status tenant',
        tenant: 'Nada Malam',
        changeType: 'status',
        from: 'Ditangguhkan',
        to: 'Aktif',
        timestamp: '10 Sep 2026, 08:00 WIB · pembayaran terverifikasi lunas',
    },
])

const filteredLog = computed(() => {
    return auditLog.value.filter((entry) => {
        if (filterTenant.value !== 'all') {
            const slug = entry.tenant.toLowerCase().replace(/\s+/g, '-')
            if (slug !== filterTenant.value) return false
        }
        if (filterType.value !== 'all' && entry.changeType !== filterType.value) return false
        return true
    })
})

function dotColor(type: string) {
    switch (type) {
        case 'status': return 'bg-warning'
        case 'plan': return 'bg-success'
        case 'delete': return 'bg-error'
        default: return 'bg-neutral-400'
    }
}

useHead({
    title: 'Audit Trail',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-3 mb-6">
            <USelect
                v-model="filterTenant"
                :items="tenantOptions"
                class="w-48"
            />
            <USelect
                v-model="filterType"
                :items="typeOptions"
                class="w-48"
            />
            <UInput
                v-model="filterDateRange"
                icon="lucide:calendar"
                placeholder="Rentang tanggal"
                class="w-48"
            />
            <div class="ml-auto">
                <UBadge
                    color="neutral"
                    variant="subtle"
                >
                    <UIcon
                        name="lucide:lock"
                        class="size-3 mr-1"
                    />
                    Append-only log
                </UBadge>
            </div>
        </div>

        <!-- Timeline Card -->
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <h3>Riwayat perubahan tenant</h3>
                    <small class="text-neutral-500">
                        {{ filteredLog.length }} dari {{ auditLog.length }} entri
                    </small>
                </div>
            </template>

            <div
                v-if="filteredLog.length === 0"
                class="py-8 text-center text-neutral-400 text-sm"
            >
                Tidak ada entri yang cocok dengan filter.
            </div>

            <div
                v-else
                class="divide-y divide-neutral-100"
            >
                <div
                    v-for="entry in filteredLog"
                    :key="entry.id"
                    class="flex gap-4 py-4 px-2"
                >
                    <!-- Dot -->
                    <div class="pt-1.5 flex-none">
                        <span
                            class="block w-2.5 h-2.5 rounded-full"
                            :class="dotColor(entry.changeType)"
                        />
                    </div>

                    <!-- Content -->
                    <div class="flex-1">
                        <p class="text-sm">
                            <strong>{{ entry.actor }} ({{ entry.actorType === 'superadmin' ? 'superadmin' : 'otomatis' }})</strong>
                            {{ entry.action }}
                            <strong>{{ entry.tenant }}</strong>
                        </p>

                        <!-- Diff -->
                        <div
                            v-if="entry.from && entry.to"
                            class="flex items-center gap-2 mt-1.5 text-xs"
                        >
                            <span class="text-neutral-400 line-through">{{ entry.from }}</span>
                            <UIcon
                                name="lucide:arrow-right"
                                class="size-3 text-neutral-300"
                            />
                            <span class="font-semibold">{{ entry.to }}</span>
                        </div>

                        <small class="text-neutral-400 mt-1 block">
                            {{ entry.timestamp }}
                        </small>
                    </div>
                </div>
            </div>
        </UCard>

        <!-- Info Callout -->
        <div class="mt-4 rounded-lg border border-dashed border-neutral-300 p-3 bg-neutral-50">
            <small class="text-neutral-500">
                Log tidak bisa diedit maupun dihapus oleh siapapun termasuk superadmin, untuk menjaga integritas audit.
                Field <code class="text-xs">changed_by</code>/<code class="text-xs">changed_at</code> dari Release 1
                menjadi sumber data awal.
            </small>
        </div>
    </div>
</template>
