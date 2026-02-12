<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
useHead({
    title: 'Dashboard',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const columns: TableColumn<DummyTenant>[] = [
    {
        accessorKey: 'tenantName',
        header: 'Tenant Name',
        meta: {
            class: {
                td: 'font-semibold',
            },
        },
    },
    {
        accessorKey: 'adminEmail',
        header: 'Admin Email',
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
                label: row.getValue('status'),
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

const data = ref<DummyTenant[]>([])
onMounted(() => {
    data.value = DUMMY_TENANTS as DummyTenant[]
})
</script>

<template>
    <div class="my-8">
        <div class="grid grid-cols-3 gap-4 mb-8">
            <CardTotal
                title="Total Tenants"
                :total="142"
                icon="lucide:building"
                with-stats
                stats="12%"
                stats-status="up"
                stats-text="vs last month"
            />

            <CardTotal
                title="Active Events"
                :total="84"
                icon="lucide:calendar"
                with-stats
                stats="5%"
                stats-status="up"
                stats-text="vs last month"
            />

            <CardTotal
                title="Total Check-ins"
                :total="12500"
                icon="lucide:users"
                with-stats
                stats="25%"
                stats-status="down"
                stats-text="vs last month"
            />
        </div>

        <div>
            <UCard>
                <template #header>
                    <div class="flex justify-between items-center">
                        <h3>Tenant Management</h3>
                        <UButton
                            color="primary"
                            icon="lucide:plus"
                            class="cursor-pointer"
                            to="/tenants/add"
                        >
                            Add Tenant
                        </UButton>
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
    </div>
</template>
