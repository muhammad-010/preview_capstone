<script setup lang="ts">
const emit = defineEmits([EMIT_TABLE_REFRESH])
const target = defineModel<TenantForm | undefined>('fields', { default: undefined })
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
            title="Tenant Information"
            :subtitle="targetId ? 'Update current tenant organization details' : 'Enter the details for the new tenant organization'"
            :loading="formLoading"
            @cancel="router.back()"
            @save="saveForm"
        >
            <PageTenantForm
                ref="formRef"
                v-model:loading="formLoading"
                v-model:success="formSuccess"
                :tenant-id="targetId"
                :fields="target"
            />
        </CardForm>
    </div>
</template>
