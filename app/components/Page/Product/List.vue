<script setup lang="ts">
const search = ref('')
const query = ref('')
const page = ref(1)
const limit = ref(4)
const total = computed(() => 4)

function searchData() {
    // page.value = 1
    query.value = search.value
    // refresh()
}

function clearSearch() {
    // page.value = 1
    // search.value = ''
    query.value = search.value
    // refresh()
}
</script>

<template>
    <div class="my-8">
        <div class="mb-6">
            <div class="card-toolbar">
                <div class="card-toolbar-left-wrapper">
                    <DataTableSearch
                        v-model="search"
                        class="card-toolbar-left w-full"
                        placeholder="Search Products"
                        @search="searchData"
                        @clear="clearSearch"
                    />
                </div>

                <div class="card-toolbar-actions">
                    <UButton
                        color="primary"
                        icon="lucide:plus"
                        class="cursor-pointer"
                    >
                        Add Product
                    </UButton>
                </div>
            </div>
        </div>

        <PageProductTable
            v-model:limit="limit"
            v-model:page="page"
            :total="total"
            :with-pagination="true"
        />
    </div>
</template>
