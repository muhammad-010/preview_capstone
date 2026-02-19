<script setup lang="ts">
import type { Form, FormSubmitEvent, StepperItem } from '@nuxt/ui'
import * as z from 'zod'

const router = useRouter()
const { tenantId } = useUserState()
const props = defineProps<{
    id?: number
    fields?: TenantEventForm
}>()
const formRef = useTemplateRef<Form<TenantEventForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}

function useTenantEventForm(tId: number, id: number) {
    const isCreate = !id
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
    const toast = useToast()
    const loading = ref(false)
    const activeSteps = ref(0)

    const schema = z.object({
        name: z
            .string()
            .min(1, 'Event name is required'),
        description: z
            .string()
            .optional(),
        location: z
            .string()
            .min(1, 'Location is required'),
        start_time: z
            .iso
            .datetime(),
        end_time: z
            .iso
            .datetime(),
        capacity: z
            .number(),
    })
    type Schema = z.output<typeof schema>

    const state = reactive<Partial<TenantEventForm>>(props.fields ?? {
        name: '',
        description: '',
        location: '',
        start_time: '',
        end_time: '',
        capacity: 0,
        confirmation_attendance: false,
        status: 'Active',
        assign_user_ids: [],
    })

    async function addData(payload: FormSubmitEvent<Schema>) {
        try {
            const data = await $fetch(`/api/tenant/${tId}/event`, {
                method: 'POST',
                body: payload.data,
            })
            if (data.success) {
                toast.add({
                    title: 'Success',
                    description: 'An event has been created',
                    color: 'success',
                })
                router.go(-1)
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to create new event',
                color: 'error',
            })
            console.error('Add event error', error)
        }
    }

    async function editData(payload: FormSubmitEvent<Schema>, id: number) {
        try {
            const data = await $fetch(`/api/tenant/${tId}/event/${id}`, {
                method: 'PUT',
                body: payload.data,
            })
            if (data.success) {
                toast.add({
                    title: 'Success',
                    description: 'An event has been updated',
                    color: 'success',
                })
                router.go(-1)
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to update new event',
                color: 'error',
            })
            console.error('Edit event error', error)
        }
    }

    async function submitData(payload: FormSubmitEvent<Schema>) {
        loading.value = true
        if (isCreate) {
            await addData(payload)
        }
        else {
            await editData(payload, id)
        }
        loading.value = false
    }

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

    return {
        isCreate,
        activeSteps,
        steps,
        state,
        loading,
        schema,
        submitData,
        nextStep,
        prevStep,
    }
}

const {
    activeSteps,
    steps,
    state,
    loading,
    schema,
    submitData,
    nextStep,
    prevStep,
} = useTenantEventForm(tenantId.value, props.id || 0)
</script>

<template>
    <div class="my-8">
        <CardForm
            title="Event Information"
            subtitle="Enter event detail and assign POC"
            :loading="loading"
            with-stepper
            :total-step="steps.length"
            :active-step-index="activeSteps"
            @next-step="nextStep"
            @prev-step="prevStep"
            @cancel="router.back()"
            @save="saveData"
        >
            <UForm
                ref="formRef"
                :schema="schema"
                :state="state"
                @submit.prevent="submitData"
            >
                <UStepper
                    v-model="activeSteps"
                    :items="steps"
                    class="w-full"
                >
                    <template #info>
                        <div class="grid md:grid-cols-2 gap-6">
                            <UFormField
                                label="Event Name"
                                name="name"
                                required
                                class="my-2 w-full"
                            >
                                <UInput
                                    v-model="state.name"
                                    type="text"
                                    class="w-full"
                                />
                            </UFormField>

                            <UFormField
                                label="Venue"
                                name="location"
                                required
                                class="my-2 w-full"
                            >
                                <UInput
                                    v-model="state.location"
                                    type="text"
                                    class="w-full"
                                />
                            </UFormField>

                            <UFormField
                                label="Start Time"
                                name="start_time"
                                required
                                class="my-2 w-full"
                            >
                                <InputDateTime
                                    v-model="state.start_time"
                                />
                            </UFormField>

                            <UFormField
                                label="End Time"
                                name="end_time"
                                required
                                class="my-2 w-full"
                            >
                                <InputDateTime
                                    v-model="state.end_time"
                                />
                            </UFormField>

                            <UFormField
                                label="Description"
                                name="description"
                                class="my-2 w-full"
                            >
                                <UTextarea
                                    v-model="state.description"
                                    size="lg"
                                    class="w-full"
                                />
                            </UFormField>

                            <div class="flex flex-col gap-2">
                                <UFormField
                                    label="Total Capacity"
                                    name="capacity"
                                    class="my-2 w-full"
                                >
                                    <UInput
                                        v-model="state.capacity"
                                        type="number"
                                        class="w-full"
                                    />
                                </UFormField>

                                <UFormField
                                    label="Attendance Confirmation"
                                    name="confirmation_attendance"
                                    class="my-2 w-full"
                                >
                                    <USwitch v-model="state.confirmation_attendance" />
                                </UFormField>
                            </div>
                        </div>
                    </template>

                    <template #poc>
                        POC
                    </template>
                </UStepper>
            </UForm>
        </CardForm>
    </div>
</template>
