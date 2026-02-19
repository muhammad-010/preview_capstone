<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()

async function useList(tId: number) {
    const search = ref('')
    const query = ref('')
    const page = ref(1)
    const limit = ref(5)

    const { data, pending, refresh } = await useFetch(`/api/tenant/${tId}/event`, {
        transform: res => res.data,
        query: { query, page, limit },
        watch: [page, limit],
    })
    const events = computed<TenantEvent[]>(() => data.value?.events ?? [])
    const total = computed(() => data.value?.total_data ?? 0)

    function searchEvent() {
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
        events,
        total,
        pending,
        searchEvent,
        clearSearch,
    }
}

const {
    search,
    page,
    limit,
    events,
    total,
    pending,
    searchEvent,
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
                <div class="flex justify-between items-center">
                    <InputSearch
                        v-model="search"
                        @search="searchEvent"
                        @clear="clearSearch"
                    />

                    <div class="flex gap-2">
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
                :data="events"
                :total="total"
                :pending="pending"
                with-pagination
            />
        </UCard>
    </div>
</template>
