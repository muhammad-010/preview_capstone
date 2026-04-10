<script setup lang="ts">
defineProps<{
    tenantId: number
}>()
const emit = defineEmits([EMIT_TABLE_REFRESH])
const target = defineModel<UserForm | undefined>('fields', { default: undefined })
const targetId = defineModel<number | undefined>('id', { default: undefined })
const router = useRouter()
const formRef = ref()
const formLoading = ref(false)
const formSuccess = ref(false)

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
            title="Member Information"
            :subtitle="targetId ? 'Update current member details' : 'Enter the details for the new member'"
            :loading="formLoading"
            @cancel="router.back()"
            @save="saveForm"
        >
            <PageMemberForm
                ref="formRef"
                v-model:loading="formLoading"
                v-model:success="formSuccess"
                :tenant-id="tenantId"
                :user-id="targetId"
                :fields="target"
            />
        </CardForm>
    </div>
</template>
