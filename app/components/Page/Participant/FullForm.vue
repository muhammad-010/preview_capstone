<script setup lang="ts">
defineProps<{
    tenantId: number
    eventId: number
}>()
const emit = defineEmits([EMIT_TABLE_REFRESH])
const target = defineModel<ParticipantForm | undefined>('fields', { default: undefined })
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
            :subtitle="targetId ? 'Update current participant details' : 'Enter the details for the new participant'"
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
                :participant-id="targetId"
                :fields="target"
            />
        </CardForm>
    </div>
</template>
