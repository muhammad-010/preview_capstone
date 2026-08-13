<script setup lang="ts">
defineProps<{
    tenantId: number
}>()

const emit = defineEmits([EMIT_TABLE_REFRESH])
const fields = defineModel<TenantForm | undefined>('fields', { default: undefined })
const router = useRouter()
const formRef = ref()
const formLoading = ref(false)
const formSuccess = ref(false)
const submitDisabled = ref(true)

async function saveForm() {
    try {
        await formRef.value.saveData()
        if (formSuccess.value) {
            router.go(-1)
            formSuccess.value = false
        }
    }
    catch { /* empty */ }
    formLoading.value = false
    emit(EMIT_TABLE_REFRESH)
}
</script>

<template>
    <div class="my-8">
        <CardForm
            v-model:submit-disabled="submitDisabled"
            title="Notification Information"
            subtitle="Complete notification data to be sent"
            save-label="Distribute Notification"
            save-icon="lucide:send"
            :loading="formLoading"
            @cancel="router.back()"
            @save="saveForm"
        >
            <PageDistributeParticipantForm
                ref="formRef"
                v-model:loading="formLoading"
                v-model:success="formSuccess"
                v-model:submit-disabled="submitDisabled"
                :tenant-id="tenantId"
                :fields="fields"
            />
        </CardForm>
    </div>
</template>
