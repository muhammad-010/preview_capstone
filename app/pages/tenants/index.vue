<script setup lang="ts">
const route = useRoute()

async function useList() {
    const search = ref('')
    const query = ref('')
    const page = ref(1)
    const limit = ref(5)

    const DUMMY_TENANTS: Tenant[] = [
        {
            tenant_id: 1,
            name: 'Kopi Darat ID',
            status: 'Active',
            owner: { name: 'Ahmad Faisal', email: 'ahmad@kopidarat.id', phone: { number: '8123456789' } },
            total_event: 12,
            total_registered_user: 1250,
            plan: 'Pro',
            joined_at: '2025-01-15T10:00:00Z'
        },
        {
            tenant_id: 2,
            name: 'Studio Panggung',
            status: 'Active',
            owner: { name: 'Budi Santoso', email: 'budi@studiopanggung.com', phone: { number: '8129876543' } },
            total_event: 5,
            total_registered_user: 300,
            plan: 'Basic',
            joined_at: '2025-03-20T14:30:00Z'
        },
        {
            tenant_id: 3,
            name: 'Nada Malam',
            status: 'Inactive',
            owner: { name: 'Citra Dewi', email: 'citra@nadamalam.id', phone: { number: '8134567890' } },
            total_event: 48,
            total_registered_user: 15400,
            plan: 'Enterprise',
            joined_at: '2024-11-05T09:15:00Z'
        },
        {
            tenant_id: 4,
            name: 'Loka Festival',
            status: 'Active',
            owner: { name: 'Deni Pratama', email: 'deni@lokafest.id', phone: { number: '8112233445' } },
            total_event: 2,
            total_registered_user: 150,
            plan: 'Trial',
            joined_at: '2025-08-10T16:45:00Z'
        },
        {
            tenant_id: 5,
            name: 'Panggung Rakyat',
            status: 'Inactive',
            owner: { name: 'Eka Saputra', email: 'eka@panggungrakyat.com', phone: { number: '8198765432' } },
            total_event: 0,
            total_registered_user: 0,
            plan: 'Trial',
            joined_at: '2025-09-01T08:00:00Z'
        },
        {
            tenant_id: 6,
            name: 'Senandung Riang',
            status: 'Active',
            owner: { name: 'Fikri Rahman', email: 'fikri@senandung.id', phone: { number: '8122334455' } },
            total_event: 15,
            total_registered_user: 4200,
            plan: 'Pro',
            joined_at: '2024-05-12T11:20:00Z'
        },
        {
            tenant_id: 7,
            name: 'Konser Kita',
            status: 'Active',
            owner: { name: 'Gita Pertiwi', email: 'gita@konserkita.com', phone: { number: '8156789012' } },
            total_event: 22,
            total_registered_user: 8900,
            plan: 'Enterprise',
            joined_at: '2024-01-25T13:40:00Z'
        },
    ]

    const pending = ref(false)
    const list = ref<Tenant[]>([])
    const total = ref(0)

    async function refresh() {
        pending.value = true
        await new Promise(r => setTimeout(r, 500))
        
        let filtered = DUMMY_TENANTS
        if (query.value) {
            const q = query.value.toLowerCase()
            filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || t.owner.name.toLowerCase().includes(q))
        }
        
        total.value = filtered.length
        const start = (page.value - 1) * limit.value
        list.value = filtered.slice(start, start + limit.value)
        
        pending.value = false
    }

    onMounted(() => {
        refresh()
    })

    watch([page, limit], () => {
        refresh()
    })

    function searchData() {
        page.value = 1
        query.value = search.value
        refresh()
    }

    function clearSearch() {
        page.value = 1
        search.value = ''
        query.value = search.value
        refresh()
    }

    return {
        search,
        page,
        limit,
        list,
        total,
        pending,
        searchData,
        clearSearch,
    }
}

const {
    search,
    page,
    limit,
    list,
    total,
    pending,
    searchData,
    clearSearch,
} = await useList()

// Filter state
const filterStatus = ref('all')
const filterTier = ref('all')
const filterPayment = ref('all')
const showFilters = ref(false)

const statusOptions = [
    { label: 'Status: Semua', value: 'all' },
    { label: 'Trial', value: 'trial' },
    { label: 'Aktif', value: 'active' },
    { label: 'Ditangguhkan', value: 'suspended' },
    { label: 'Nonaktif', value: 'inactive' },
]

const tierOptions = [
    { label: 'Tier: Semua', value: 'all' },
    { label: 'Basic', value: 'basic' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise' },
]

const paymentOptions = [
    { label: 'Pembayaran: Semua', value: 'all' },
    { label: 'Lunas', value: 'paid' },
    { label: 'Menunggak', value: 'overdue' },
]

const activeFilters = computed(() => {
    const filters: { label: string, key: string }[] = []
    if (filterStatus.value !== 'all') {
        const opt = statusOptions.find(o => o.value === filterStatus.value)
        filters.push({ label: `Status: ${opt?.label || filterStatus.value}`, key: 'status' })
    }
    if (filterTier.value !== 'all') {
        const opt = tierOptions.find(o => o.value === filterTier.value)
        filters.push({ label: `Tier: ${opt?.label || filterTier.value}`, key: 'tier' })
    }
    if (filterPayment.value !== 'all') {
        const opt = paymentOptions.find(o => o.value === filterPayment.value)
        filters.push({ label: `Pembayaran: ${opt?.label || filterPayment.value}`, key: 'payment' })
    }
    return filters
})

function removeFilter(key: string) {
    if (key === 'status') filterStatus.value = 'all'
    if (key === 'tier') filterTier.value = 'all'
    if (key === 'payment') filterPayment.value = 'all'
}

function resetFilters() {
    filterStatus.value = 'all'
    filterTier.value = 'all'
    filterPayment.value = 'all'
}

function exportCSV() {
    const toast = useToast()
    toast.add({
        title: 'Export CSV',
        description: 'File CSV sedang disiapkan...',
        color: 'info',
    })
}

function exportExcel() {
    const toast = useToast()
    toast.add({
        title: 'Export Excel',
        description: 'File Excel sedang disiapkan...',
        color: 'info',
    })
}

useHead({
    title: 'Tenant',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <UCard>
            <template #header>
                <div class="card-toolbar">
                    <DataTableSearch
                        v-model="search"
                        class="card-toolbar-left"
                        @search="searchData"
                        @clear="clearSearch"
                    />

                    <div class="card-toolbar-actions">
                        <UButton
                            color="neutral"
                            variant="outline"
                            icon="lucide:filter"
                            class="cursor-pointer"
                            @click="showFilters = !showFilters"
                        >
                            Filter
                        </UButton>
                        <UButton
                            color="primary"
                            icon="lucide:plus"
                            class="cursor-pointer"
                            to="/tenants/add"
                        >
                            Add Tenant
                        </UButton>
                    </div>
                </div>

                <!-- Filters Row -->
                <Transition name="fade">
                    <div
                        v-if="showFilters"
                        class="mt-4"
                    >
                        <div class="flex flex-wrap items-center gap-3">
                            <USelect
                                v-model="filterStatus"
                                :items="statusOptions"
                                class="w-40"
                                size="sm"
                            />
                            <USelect
                                v-model="filterTier"
                                :items="tierOptions"
                                class="w-40"
                                size="sm"
                            />
                            <USelect
                                v-model="filterPayment"
                                :items="paymentOptions"
                                class="w-44"
                                size="sm"
                            />

                            <UButton
                                v-if="activeFilters.length > 0"
                                color="neutral"
                                variant="ghost"
                                size="xs"
                                @click="resetFilters"
                            >
                                Reset filter
                            </UButton>

                            <div class="ml-auto flex gap-2">
                                <UButton
                                    color="neutral"
                                    variant="outline"
                                    size="sm"
                                    icon="lucide:file-text"
                                    @click="exportCSV"
                                >
                                    CSV
                                </UButton>
                                <UButton
                                    color="warning"
                                    size="sm"
                                    icon="lucide:file-spreadsheet"
                                    @click="exportExcel"
                                >
                                    Excel
                                </UButton>
                            </div>
                        </div>

                        <!-- Active Filter Chips -->
                        <div
                            v-if="activeFilters.length > 0"
                            class="flex flex-wrap gap-2 mt-3"
                        >
                            <UBadge
                                v-for="filter in activeFilters"
                                :key="filter.key"
                                color="neutral"
                                variant="outline"
                                class="cursor-pointer"
                                @click="removeFilter(filter.key)"
                            >
                                {{ filter.label }}
                                <UIcon
                                    name="lucide:x"
                                    class="size-3 ml-1"
                                />
                            </UBadge>
                        </div>
                    </div>
                </Transition>
            </template>

            <PageTenantTable
                v-model:limit="limit"
                v-model:page="page"
                :data="list"
                :total="total"
                :pending="pending"
                with-pagination
            />
        </UCard>

        <!-- Quick Links -->
        <div class="flex flex-wrap gap-3 mt-6">
            <UButton
                color="neutral"
                variant="outline"
                icon="lucide:database"
                to="/tenants/quota"
            >
                Kuota Resource
            </UButton>
            <UButton
                color="neutral"
                variant="outline"
                icon="lucide:user-x"
                to="/tenants/admin-accounts"
            >
                Kelola Admin Accounts
            </UButton>
        </div>
    </div>
</template>
