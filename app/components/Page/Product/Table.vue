<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
    storeId: number
    data: TenantEventStoreProduct[]
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })
const emit = defineEmits([EMIT_TABLE_REFRESH, EMIT_TABLE_OPEN_EDIT])

function triggerRefresh(skipResetPage?: boolean) {
    if (!skipResetPage) {
        page.value = 1
    }
    emit(EMIT_TABLE_REFRESH)
}

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()

// DELETION
const deleteConfirmation = ref(false)
const deleteTarget = ref({
    id: 0,
    name: '',
})

function setDeleteTarget(id: number, name: string) {
    deleteTarget.value.id = id
    deleteTarget.value.name = name
}

function openDeleteConfirmation(id: number, name: string) {
    setDeleteTarget(id, name)
    deleteConfirmation.value = true
}

function closeDeleteConfirmation(skipResetPage?: boolean) {
    setDeleteTarget(0, '')
    deleteConfirmation.value = false
    triggerRefresh(skipResetPage)
}

async function deleteData(id: number) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/store/${props.storeId}/product/${id}`, {
            method: 'DELETE',
        })
        if (data.success) {
            successToast({ description: 'A product has been deleted' })
            closeDeleteConfirmation()
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to delete product' })
        closeDeleteConfirmation(true)
    }
}

// UPDATION
async function editData(id: number) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/store/${props.storeId}/product/${id}`)
        if (data.success) {
            emit(EMIT_TABLE_OPEN_EDIT, storeProductToStoreProductForm(data.data), id)
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to get product detail' })
        closeDeleteConfirmation(true)
    }
}

// DETAILION
const detailDialog = ref(false)
const target = ref<TenantEventStoreProduct | undefined>()

function openDetail(product: TenantEventStoreProduct) {
    target.value = cloneObject(product)
    detailDialog.value = true
}

function formatPrice(value: number, currency?: string): string {
    const formatter = getCurrencyFormatter(currency)
    return formatter.format(value)
}
</script>

<template>
    <div>
        <div class="grid grid-cols-4 gap-4 mb-6">
            <UCard
                v-for="product in data"
                :key="product.product_id"
                :ui="{
                    root: 'h-full flex flex-col',
                    header: 'relative h-36',
                    body: 'flex-1 sm:px-4',
                    footer: 'mt-auto sm:px-4',
                }"
            >
                <template #header>
                    <div
                        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        :style="{ backgroundImage: `url('${product.image_url}')` }"
                    />
                    <div class="absolute right-2 top-2 flex gap-2">
                        <UBadge
                            v-if="product.status === 'inactive'"
                            size="lg"
                            color="error"
                            label="Unpublished"
                        />
                    </div>
                </template>

                <template #default>
                    <div class="flex flex-col h-full">
                        <h3 class="mb-4 font-bold">
                            {{ product.name }}
                        </h3>

                        <div class="mt-auto">
                            <div class="flex items-center gap-2 mb-2">
                                <h3
                                    v-if="product.discount_value > 0"
                                    class="font-normal text-muted line-through decoration-2"
                                >
                                    {{ formatPrice(product.price, product.currency) }}
                                </h3>
                                <UBadge
                                    v-if="product.discount_value > 0"
                                    color="warning"
                                    variant="subtle"
                                    :label="`${product.discount_value}% Off`"
                                />
                            </div>
                            <h2 class="font-bold mb-2">
                                {{ formatPrice(product.final_price || product.price, product.currency) }}
                            </h2>

                            <div class="flex gap-2">
                                <UBadge
                                    icon="lucide:package"
                                    color="info"
                                    size="lg"
                                    variant="subtle"
                                    :label="`Stock: ${formatThousandNumber(product.stock?.total || 0)}`"
                                    :ui="{ base: 'rounded-md!' }"
                                />
                                <UBadge
                                    icon="lucide:package-open"
                                    color="success"
                                    size="lg"
                                    variant="subtle"
                                    :label="`Sold: ${formatThousandNumber(product.stock?.reserved || 0)}`"
                                    :ui="{ base: 'rounded-md!' }"
                                />
                            </div>
                        </div>
                    </div>
                </template>

                <template #footer>
                    <div class="flex gap-2 justify-between">
                        <UButton
                            size="lg"
                            icon="lucide:eye"
                            color="neutral"
                            variant="soft"
                            class="w-full"
                            label="Preview"
                            @click="() => openDetail(product)"
                        />
                        <div class="flex gap-2">
                            <UButton
                                size="lg"
                                icon="lucide:pencil"
                                color="neutral"
                                variant="soft"
                                @click="() => editData(product.product_id)"
                            />
                            <UButton
                                size="lg"
                                icon="lucide:trash"
                                color="error"
                                variant="soft"
                                @click="() => openDeleteConfirmation(product.product_id, product.name)"
                            />
                        </div>
                    </div>
                </template>
            </UCard>
        </div>

        <DataTablePagination
            v-if="withPagination"
            v-model:limit="limit"
            v-model:page="page"
            :total="total"
            :pagination-limit="[4, 8, 24, 48]"
            :no-border="true"
        />

        <ModalConfirmNegativeAction
            v-model:open="deleteConfirmation"
            title="Delete Confirmation"
            :body="`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone`"
            @confirm="deleteData(deleteTarget.id)"
        />

        <PageProductModalDetail
            v-model:open="detailDialog"
            v-model:fields="target"
        />
    </div>
</template>
