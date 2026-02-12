<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
useHead({
    title: 'Tenant',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const columns: TableColumn<DummyTenant>[] = [
    {
        accessorKey: 'tenantName',
        header: 'Tenant Name',
        cell: ({ row }) => {
            return h('div', {}, [
                h('span', { class: 'font-semibold' }, row.original.tenantName),
                h('br'),
                h('span', { class: 'text-sm' }, row.original.adminName),
            ])
        },
    },
    {
        accessorKey: 'adminEmail',
        header: 'Admin Email',
        cell: ({ row }) => {
            return h('div', {}, [
                h('span', {}, row.original.adminEmail),
                h('br'),
                h('span', { class: 'text-sm' }, row.original.adminPhone),
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
        accessorKey: 'events',
        header: 'Events',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            return h(UBadge, {
                color: STATUS_COLORS[row.getValue('status') as 'active' | 'inactive'],
                variant: 'subtle',
                label: row.original.status,
            })
        },
    },
    {
        accessorKey: 'id',
        header: 'Action',
        cell: ({ row }) => {
            return h('div', { class: 'flex gap-2' }, [
                h(UButton, {
                    color: 'secondary',
                    variant: 'ghost',
                    icon: 'lucide:pencil',
                    to: `tenants/${row.original.id}/edit`,
                }),
                h(UButton, {
                    color: 'secondary',
                    variant: 'ghost',
                    icon: 'lucide:info',
                    to: `tenants/${row.original.id}`,
                }),
            ])
        },
    },
]

const data = ref<DummyTenant[]>(DUMMY_TENANTS as DummyTenant[])
onMounted(() => {
    data.value = DUMMY_TENANTS as DummyTenant[]
})
</script>

<template>
    <div class="my-8">
        <UCard>
            <template #header>
                <div class="flex justify-between items-center">
                    <UInput
                        icon="lucide:search"
                        type="text"
                        placeholder="Search"
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
                    :data="data"
                    :columns="columns"
                />
            </div>
        </UCard>
    </div>
</template>
