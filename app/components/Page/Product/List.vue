<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
    storeId: number
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])

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

function refreshData() {
    //refresh()
    emit(EMIT_DETAIL_REFRESH)
}

const formDialog = ref(false)
const targetId = ref<number | undefined>()
//const target = ref<CustomAttributeForm | undefined>()

function openAddForm() {
    targetId.value = undefined
    //target.value = undefined
    formDialog.value = true
}

/*
function openEditForm(fields: CustomAttributeForm, id: number) {
    targetId.value = id
    target.value = fields
    formDialog.value = true
}
*/
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
                        @click="openAddForm"
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

        <PageProductModalForm
            v-model:open="formDialog"
            v-model:id="targetId"
            :tenant-id="tenantId"
            :event-id="eventId"
            :store-id="storeId"
            @refresh="refreshData"
        />
    </div>
</template>
