<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()

async function useList(tId: number) {
    const search = ref('')
    const query = ref('')
    const page = ref(1)
    const limit = ref(5)

    const { data, pending, refresh } = await useApi(`/api/tenant/${tId}/event`, {
        transform: res => res.data,
        query: { query, page, limit },
        watch: [page, limit],
    })
    const list = computed<TenantEvent[]>(() => data.value?.event ?? [])
    const total = computed(() => data.value?.total_data ?? 0)

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
} = await useList(tenantId.value)

useHead({
    title: 'Events',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <UCard>
            <template #header>
                <div class="card-toolbar">
                    <InputSearch
                        v-model="search"
                        class="card-toolbar-left"
                        @search="searchData"
                        @clear="clearSearch"
                    />

                    <div class="card-toolbar-actions">
                        <!-- <UButton
                            color="neutral"
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
                            to="/events/add"
                        >
                            Add Event
                        </UButton>
                    </div>
                </div>
            </template>

            <TableEvent
                v-model:limit="limit"
                v-model:page="page"
                :data="list"
                :total="total"
                :pending="pending"
                with-pagination
            />
        </UCard>
    </div>
</template>
