<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
const props = defineProps<{
    tenantId: number
    eventId: number
    sessionId?: number
    fields?: TenantEventSessionForm
    isModal?: boolean
}>()
const loading = defineModel<boolean>('loading', { default: false })
const success = defineModel<boolean>('success', { default: false })
const formRef = useTemplateRef<Form<TenantEventSessionForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}
defineExpose({ saveData })

const isCreate = !props.sessionId
const schema = z.object({
    name: zodStringRequired('Session name is required'),
    start_time: zodISODatetime(),
    end_time: zodISODatetime(),
    location: zodStringRequired('Location is required'),
})
type Schema = z.output<typeof schema>

const defaultStartTime = new Date()
defaultStartTime.setSeconds(0, 0)
const defaultEndTime = new Date()
defaultEndTime.setSeconds(0, 0)
const state = reactive<Partial<TenantEventSessionForm>>(props.fields ?? {
    name: '',
    start_time: defaultStartTime.toISOString(),
    end_time: defaultEndTime.toISOString(),
    location: '',
})

async function addData(payload: FormSubmitEvent<Schema>) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/session`, {
            method: 'POST',
            body: payload.data,
        })
        if (data.success) {
            successToast({ description: 'New session has been created' })
            success.value = true
        }
        else {
            successToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to create new session' })
    }
}

async function editData(payload: FormSubmitEvent<Schema>, sessionId: number) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/session/${sessionId}`, {
            method: 'PUT',
            body: payload.data,
        })
        if (data.success) {
            successToast({ description: 'A session has been updated' })
            success.value = true
        }
        else {
            successToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to update session' })
    }
}

function submitData(payload: FormSubmitEvent<Schema>) {
    loading.value = true
    if (isCreate) {
        return addData(payload)
    }
    else {
        return editData(payload, props.sessionId)
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
        <div
            class="grid gap-6"
            :class="isModal ? '' : 'md:grid-cols-2'"
        >
            <UFormField
                label="Session Name"
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
        </div>
    </UForm>
</template>
