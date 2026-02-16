<script setup lang="ts">
const route = useRoute()

async function useList() {
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
                        <!-- <UButton
                            color="secondary"
                            variant="outline"
                            icon="lucide:filter"
                            class="cursor-pointer"
                        >
                            Filter
                        </UButton> -->
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

            <TableTenant
                v-model:limit="limit"
                v-model:page="page"
                :data="tenants"
                :total="total"
                :pending="pending"
                with-pagination
            />
        </UCard>
    </div>
</template>
