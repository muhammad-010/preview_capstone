<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'

defineProps<{
    tenantId: number
}>()
const emit = defineEmits([EMIT_TABLE_REFRESH])
const fields = defineModel<TenantEventForm | undefined>('fields', { default: undefined })
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

const steps = [
    {
        slot: 'info' as const,
        title: 'General Info',
        icon: 'lucide:info',
    },
    {
        slot: 'poc' as const,
        title: 'POC Assignment',
        icon: 'lucide:user-check',
    },
] satisfies StepperItem
const activeSteps = ref(0)
function nextStep() {
    if (activeSteps.value < steps.length - 1) {
        activeSteps.value++
    }
}
function prevStep() {
    if (activeSteps.value > 0) {
        activeSteps.value--
    }
}
</script>

<template>
    <div class="my-8">
        <CardForm
            title="Event Information"
            :subtitle="id ? 'Update current event details' : 'Enter event detail and assign POC'"
            :loading="formLoading"
            with-stepper
            :total-step="steps.length"
            :active-step-index="activeSteps"
            @next-step="nextStep"
            @prev-step="prevStep"
            @cancel="router.back()"
            @save="saveForm"
        >
            <PageEventForm
                ref="formRef"
                v-model:loading="formLoading"
                v-model:success="formSuccess"
                v-model:active-step="activeSteps"
                :tenant-id="tenantId"
                :event-id="id"
                :fields="fields"
                :steps="steps"
            />
        </CardForm>
    </div>
</template>
