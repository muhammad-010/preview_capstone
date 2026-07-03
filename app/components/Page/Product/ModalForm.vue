<script setup lang="ts">
defineProps<{
    tenantId: number
    eventId: number
    storeId: number
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])
const formDialog = defineModel<boolean>('open', { default: false })
//const fields = defineModel<TenantEventStoreForm | undefined>('fields', { default: undefined })
const id = defineModel<number | undefined>('id', { default: undefined })
const formRef = ref()
const formLoading = ref(false)
const formSuccess = ref(false)

function closeForm(close: () => void) {
    close()
    //fields.value = undefined
    id.value = undefined
}

async function saveForm(close: () => void) {
    try {
        await formRef.value.saveData()
        if (formSuccess.value) {
            closeForm(close)
            formSuccess.value = false
        }
    }
    catch { /* empty */ }
    formLoading.value = false
    emit(EMIT_DETAIL_REFRESH)
}
</script>

<template>
    <UModal
        v-model:open="formDialog"
        :dismissible="false"
        :ui="{ content: 'sm:max-w-4xl', body: 'p-0 sm:p-0' }"
    >
        <template #header="{ close }">
            <div class="flex justify-between items-center w-full">
                <!-- <h5>{{ fields ? 'Edit' : 'Add' }} Product</h5> -->
                <h5>{{ 'Form' }} Product</h5>

                <UButton
                    color="neutral"
                    variant="ghost"
                    icon="lucide:x"
                    @click="() => closeForm(close)"
                />
            </div>
        </template>

        <template #body>
            <MiscLoadingOverlay :loading="formLoading">
                <div class=" p-4 sm:p-6">
                    <PageProductForm
                        ref="formRef"
                        v-model:loading="formLoading"
                        v-model:success="formSuccess"
                        :tenant-id="tenantId"
                        :event-id="eventId"
                        :store-id="storeId"
                        :product-id="id"
                        is-modal
                    />
                </div>
            </MiscLoadingOverlay>
        </template>

        <template #footer="{ close }">
            <div class="flex justify-end items-center w-full">
                <div class="flex gap-2">
                    <UButton
                        color="neutral"
                        variant="outline"
                        icon="lucide:x"
                        class="cursor-pointer"
                        label="Cancel"
                        @click="() => closeForm(close)"
                    />
                    <UButton
                        color="primary"
                        icon="lucide:save"
                        class="cursor-pointer"
                        label="Save"
                        @click="() => saveForm(close)"
                    />
                </div>
            </div>
        </template>
    </UModal>
</template>
