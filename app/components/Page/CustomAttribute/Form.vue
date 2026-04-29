<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
const props = defineProps<{
    tenantId: number
    eventId: number
    attributeId?: number
    fields?: CustomAttributeForm
    isModal?: boolean
}>()
const loading = defineModel<boolean>('loading', { default: false })
const success = defineModel<boolean>('success', { default: false })
const formRef = useTemplateRef<Form<CustomAttributeForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}
defineExpose({ saveData })

const isCreate = !props.attributeId
const schema = z.object({
    name: zodStringRequired('Attribute name is required'),
    is_visible: zodBooleanRequired(),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<CustomAttributeForm>>(props.fields ?? {
    name: '',
    is_visible: false,
})

async function addData(payload: FormSubmitEvent<Schema>) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/attribute`, {
            method: 'POST',
            body: payload.data,
        })
        if (data.success) {
            successToast({ description: 'New custom attribute has been created' })
            success.value = true
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to create new custom attribute' })
    }
}

async function editData(payload: FormSubmitEvent<Schema>, attributeId: number) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/attribute/${attributeId}`, {
            method: 'PUT',
            body: payload.data,
        })
        if (data.success) {
            successToast({ description: 'A custom attribute has been updated' })
            success.value = true
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to update custom attribute' })
    }
}

function submitData(payload: FormSubmitEvent<Schema>) {
    loading.value = true
    if (isCreate) {
        return addData(payload)
    }
    else {
        return editData(payload, props.attributeId)
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
                label="Attribute Name"
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
                label="Visible When Check-In"
                name="is_visible"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <USwitch
                    v-model="state.is_visible"
                />
            </UFormField>
        </div>
    </UForm>
</template>
