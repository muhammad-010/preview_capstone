<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()
const toast = useToast()
const props = defineProps<{
    tenantId: number
    eventId: number
    customAttributeId?: number
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

async function useForm(tId: number, eId: number, id: number) {
    const isCreate = !id
    const schema = z.object({
        name: zodStringRequired('Member name is required'),
    })
    type Schema = z.output<typeof schema>

    const state = reactive<Partial<CustomAttributeForm>>(props.fields ?? {
        name: '',
    })

    async function addData(payload: FormSubmitEvent<Schema>) {
        try {
            const data = await $api(`/api/tenant/${tId}/event/${eId}/attribute`, {
                method: 'POST',
                body: payload.data,
            })
            if (data.success) {
                toast.add({
                    title: 'Success',
                    description: 'New custom attribute has been created',
                    color: 'success',
                })
                success.value = true
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to create new custom attribute',
                color: 'error',
            })
            console.error('Add custom attribute error', error)
        }
    }

    async function editData(payload: FormSubmitEvent<Schema>, id: number) {
        try {
            const data = await $api(`/api/tenant/${tId}/event/${eId}/attribute/${id}`, {
                method: 'PUT',
                body: payload.data,
            })
            if (data.success) {
                toast.add({
                    title: 'Success',
                    description: 'A custom attribute has been updated',
                    color: 'success',
                })
                success.value = true
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to update custom attribute',
                color: 'error',
            })
            console.error('Edit custom attribute error', error)
        }
    }

    function submitData(payload: FormSubmitEvent<Schema>) {
        loading.value = true
        if (isCreate) {
            return addData(payload)
        }
        else {
            return editData(payload, id)
        }
    }

    return {
        isCreate,
        loading,
        schema,
        state,
        submitData,
    }
}

const {
    schema,
    state,
    submitData,
} = await useForm(props.tenantId, props.eventId, props.customAttributeId || 0)
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
                class="my-2 w-full"
            >
                <UInput
                    v-model="state.name"
                    type="text"
                    class="w-full"
                />
            </UFormField>
        </div>
    </UForm>
</template>
