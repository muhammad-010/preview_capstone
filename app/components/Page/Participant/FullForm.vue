<script setup lang="ts">
defineProps<{
    tenantId: number
    eventId: number
}>()
const emit = defineEmits([EMIT_TABLE_REFRESH])
const fields = defineModel<ParticipantForm | undefined>('fields', { default: undefined })
const id = defineModel<number | undefined>('id', { default: undefined })
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
            title="Participant Information"
            :subtitle="id ? 'Update current participant details' : 'Enter the details for the new participant'"
            :loading="formLoading"
            @cancel="router.back()"
            @save="saveForm"
        >
            <PageParticipantForm
                ref="formRef"
                v-model:loading="formLoading"
                v-model:success="formSuccess"
                :tenant-id="tenantId"
                :event-id="eventId"
                :ticket-id="id"
                :fields="fields"
            />
        </CardForm>
    </div>
</template>
