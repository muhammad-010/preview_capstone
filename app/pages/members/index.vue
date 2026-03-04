<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()

async function useList(tId: number) {
    const search = ref('')
    const query = ref('')
    const page = ref(1)
    const limit = ref(5)

    const { data, pending, refresh } = await useApi(`/api/tenant/${tId}/user`, {
        transform: res => res.data,
        query: { query, page, limit },
        watch: [page, limit],
    })
    const list = computed<User[]>(() => data.value?.user ?? [])
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
    title: 'Users',
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
                        @search="searchData"
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
                            to="/members/add"
                        >
                            Add Member
                        </UButton>
                    </div>
                </div>
            </template>

            <TableMember
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
