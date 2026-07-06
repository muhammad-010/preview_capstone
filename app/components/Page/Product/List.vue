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

const exposed = {
    refresh: () => {},
}
defineExpose(exposed)
const { data, pending, refresh } = await useApi(`/api/tenant/${props.tenantId}/event/${props.eventId}/store/${props.storeId}/product`, {
    transform: res => res.data,
    query: computed(() => {
        return {
            query: query.value,
            page: page.value,
            limit: limit.value,
        }
    }),
    watch: false,
})
exposed.refresh = refresh

const products = computed<TenantEventStoreProduct[]>(() => data.value?.product ?? [])
const total = computed(() => data.value?.total_data ?? 0)
watch(page, () => refresh())
watch(limit, () => refresh())

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

function refreshData() {
    refresh()
    emit(EMIT_DETAIL_REFRESH)
}

const formDialog = ref(false)
const targetId = ref<number | undefined>()
const target = ref<TenantEventStoreProductForm | undefined>()

function openAddForm() {
    targetId.value = undefined
    target.value = undefined
    formDialog.value = true
}

function openEditForm(fields: TenantEventStoreProductForm, id: number) {
    targetId.value = id
    target.value = fields
    formDialog.value = true
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
                        @click="openAddForm"
                    >
                        Add Product
                    </UButton>
                </div>
            </div>
        </div>

        <PageProductModalForm
            v-model:open="formDialog"
            v-model:fields="target"
            v-model:id="targetId"
            :tenant-id="tenantId"
            :event-id="eventId"
            :store-id="storeId"
            @refresh="refreshData"
        />

        <PageProductTable
            v-model:limit="limit"
            v-model:page="page"
            :tenant-id="tenantId"
            :event-id="eventId"
            :store-id="storeId"
            :data="products"
            :total="total"
            :pending="pending"
            with-pagination
            @refresh="refreshData"
            @open-edit="openEditForm"
        />
    </div>
</template>
