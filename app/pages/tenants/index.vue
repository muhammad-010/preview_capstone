<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()

function useColumns() {
    const UBadge = resolveComponent('UBadge')
    const UButton = resolveComponent('UButton')
    const columns: TableColumn<Tenant>[] = [
        {
            accessorKey: 'name',
            header: 'Tenant Name',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', { class: 'font-semibold' }, row.original.name),
                    h('br'),
                    h('span', { class: 'text-sm' }, row.original.owner?.name || ''),
                ])
            },
        },
        {
            accessorKey: 'owner.email',
            header: 'Admin Email',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', {}, row.original.owner?.email || ''),
                    h('br'),
                    h('span', { class: 'text-sm' }, row.original.owner?.phone?.number || ''),
                ])
            },
        },
        {
            accessorKey: 'plan',
            header: 'Plan',
            cell: ({ row }) => {
                return h(UBadge, {
                    color: 'secondary',
                    variant: 'subtle',
                    label: row.original.plan,
                })
            },
        },
        {
            accessorKey: 'total_event',
            header: 'Events',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                return h(UBadge, {
                    color: STATUS_COLORS[row.getValue('status') as Status],
                    variant: 'subtle',
                    label: row.original.status,
                })
            },
        },
        {
            accessorKey: 'tenant_id',
            header: 'Action',
            cell: ({ row }) => {
                return h('div', { class: 'flex gap-2' }, [
                    h(UButton, {
                        color: 'secondary',
                        variant: 'ghost',
                        icon: 'lucide:pencil',
                        to: `tenants/${row.original.tenant_id}/edit`,
                    }),
                    h(UButton, {
                        color: 'secondary',
                        variant: 'ghost',
                        icon: 'lucide:info',
                        to: `tenants/${row.original.tenant_id}`,
                    }),
                ])
            },
        },
    ]
    return columns
}

async function useList() {
    const columns = useColumns()
    const search = ref('')
    const query = ref('')
    const page = ref(1)
    const limit = ref(5)

    const { data, pending, refresh } = await useFetch('/api/tenant', {
        transform: res => res.data,
        query: { query, page, limit },
        watch: [page, limit],
    })
    const tenants = computed<Tenant[]>(() => data.value?.tenants ?? [])
    const total = computed(() => data.value?.total_data ?? 0)

    function searchTenant() {
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
        columns,
        search,
        page,
        limit,
        tenants,
        total,
        pending,
        searchTenant,
        clearSearch,
    }
}

const {
    columns,
    search,
    page,
    limit,
    tenants,
    total,
    pending,
    searchTenant,
    clearSearch,
} = await useList()

useHead({
    title: 'Tenant',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <UCard>
            <template #header>
                <div class="flex justify-between items-center">
                    <InputSearch
                        v-model="search"
                        @search="searchTenant"
                        @clear="clearSearch"
                    />

                    <div class="flex gap-2">
                        <UButton
                            color="secondary"
                            variant="outline"
                            icon="lucide:filter"
                            class="cursor-pointer"
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
            </template>
            <div>
                <UTable
                    :data="tenants"
                    :columns="columns"
                    :loading="pending"
                />

                <MiscPagination
                    v-model:limit="limit"
                    v-model:page="page"
                    :total="total"
                />
            </div>
        </UCard>
    </div>
</template>
