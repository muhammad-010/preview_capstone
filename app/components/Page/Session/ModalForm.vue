<script setup lang="ts">
defineProps<{
    tenantId: number
    eventId: number
}>()
const emit = defineEmits([EMIT_TABLE_REFRESH])
const formDialog = defineModel<boolean>('open', { default: false })
const target = defineModel<TenantEventSessionForm | undefined>('fields', { default: undefined })
const targetId = defineModel<number | undefined>('id', { default: undefined })
const formRef = ref()
const formLoading = ref(false)
const formSuccess = ref(false)

function closeForm(close: () => void) {
    close()
    target.value = undefined
}

async function saveForm(close: () => void) {
    try {
        await formRef.value.saveData()
        if (formSuccess.value) {
            close()
            formSuccess.value = false
        }
    }
    catch { /* empty */ }
    formLoading.value = false
    emit(EMIT_TABLE_REFRESH)
}
</script>

<template>
    <UModal
        v-model:open="formDialog"
        :dismissible="false"
    >
        <template #header="{ close }">
            <div class="flex justify-between items-center w-full">
                <h5>{{ target ? 'Edit' : 'Add' }} Session</h5>

                <UButton
                    color="neutral"
                    variant="ghost"
                    icon="lucide:x"
                    @click="() => closeForm(close)"
                />
            </div>
        </template>

        <template #body>
            <MiscLoadingOverlay
                :loading="formLoading"
            >
                <PageSessionForm
                    ref="formRef"
                    v-model:loading="formLoading"
                    v-model:success="formSuccess"
                    :tenant-id="tenantId"
                    :event-id="eventId"
                    :session-id="targetId"
                    :fields="target"
                    is-modal
                />
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
