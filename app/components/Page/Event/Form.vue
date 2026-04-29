<script setup lang="ts">
import type { Form, FormSubmitEvent, StepperItem } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
const props = defineProps<{
    tenantId: number
    eventId?: number
    fields?: TenantEventForm
    isModal?: boolean
    steps: StepperItem[]
}>()
const loading = defineModel<boolean>('loading', { default: false })
const success = defineModel<boolean>('success', { default: false })
const activeSteps = defineModel<number>('active-step', { default: 0 })
const formRef = useTemplateRef<Form<TenantEventForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}
defineExpose({ saveData })

const { users } = await useFindUser(props.tenantId)

const isCreate = !props.eventId
const schema = z.object({
    name: zodStringRequired('Event name is required'),
    description: zodStringOptional(),
    location: zodStringRequired('Location is required'),
    start_time: zodISODatetime(),
    end_time: zodISODatetime(),
    capacity: zodNumberRequired(),
    status: zodStringOptional(),
    assign_user_ids: zodArrayNumber(),
})
type Schema = z.output<typeof schema>

const defaultStartTime = new Date()
defaultStartTime.setSeconds(0, 0)
const defaultEndTime = new Date()
defaultEndTime.setSeconds(0, 0)
const state = reactive<Partial<TenantEventForm>>(props.fields ?? {
    name: '',
    description: '',
    location: '',
    start_time: defaultStartTime.toISOString(),
    end_time: defaultEndTime.toISOString(),
    capacity: 0,
    status: 'Active',
    assign_user_ids: [],
})

async function addData(payload: FormSubmitEvent<Schema>) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event`, {
            method: 'POST',
            body: payload.data,
        })
        if (data.success) {
            successToast({ description: 'An event has been created' })
            success.value = true
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to create new event' })
    }
}

async function editData(payload: FormSubmitEvent<Schema>, id: number) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event/${id}`, {
            method: 'PUT',
            body: payload.data,
        })
        if (data.success) {
            successToast({ description: 'An event has been updated' })
            success.value = true
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to update new event' })
    }
}

async function submitData(payload: FormSubmitEvent<Schema>) {
    loading.value = true
    if (isCreate) {
        await addData(payload)
    }
    else {
        await editData(payload, props.eventId)
    }
}
</script>

<template>
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
                <div
                    class="grid gap-6"
                    :class="isModal ? '' : 'md:grid-cols-2'"
                >
                    <UFormField
                        label="Event Name"
                        name="name"
                        required
                        :class="`${isModal ? '' : 'my-2'} w-full`"
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
                        :class="`${isModal ? '' : 'my-2'} w-full`"
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
                        :class="`${isModal ? '' : 'my-2'} w-full`"
                    >
                        <InputDateTime
                            v-model="state.start_time"
                        />
                    </UFormField>

                    <UFormField
                        label="End Time"
                        name="end_time"
                        required
                        :class="`${isModal ? '' : 'my-2'} w-full`"
                    >
                        <InputDateTime
                            v-model="state.end_time"
                        />
                    </UFormField>

                    <UFormField
                        label="Description"
                        name="description"
                        :class="`${isModal ? '' : 'my-2'} w-full`"
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
                            :class="`${isModal ? '' : 'my-2'} w-full`"
                        >
                            <UInput
                                v-model="state.capacity"
                                type="number"
                                class="w-full"
                            />
                        </UFormField>
                    </div>
                </div>
            </template>

            <template #poc>
                <InputTransfer
                    v-model="state.assign_user_ids"
                    :options="users"
                    key-prop="user_id"
                    source-title="Available Personnel"
                    destination-title="Assigned Personnel"
                >
                    <template #default="{ option, selected, toggle }">
                        <UCard class="w-full">
                            <div class="flex w-full justify-between items-center">
                                <div>
                                    <h5>{{ option.name }}</h5>
                                    <small>{{ option.role_str || '-' }}</small>
                                </div>
                                <UButton
                                    variant="outline"
                                    :icon="selected ? 'lucide:user-plus' : 'lucide:user-minus'"
                                    :color="selected ? 'success' : 'error'"
                                    @click="toggle"
                                />
                            </div>
                        </UCard>
                    </template>
                </InputTransfer>
            </template>
        </UStepper>
    </UForm>
</template>
