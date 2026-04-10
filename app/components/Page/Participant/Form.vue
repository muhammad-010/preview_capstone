<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()
const toast = useToast()
const props = defineProps<{
    tenantId: number
    eventId: number
    participantId?: number
    fields?: ParticipantForm
    isModal?: boolean
}>()
const loading = defineModel<boolean>('loading', { default: false })
const success = defineModel<boolean>('success', { default: false })
const formRef = useTemplateRef<Form<ParticipantForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}
defineExpose({ saveData })

const { customAttributes } = await useFindCustomAttribute(props.tenantId, props.eventId)

const isCreate = !props.participantId
const schema = z.object({
    name: zodStringRequired('Participant name is required'),
    email: zodEmailRequired(),
    phone_number: zodPhoneNumberRequired(),
    max_attendance: zodNumberOptional(),
    custom_attribute: z.array(
        z.object({
            custom_attribute_id: z.number(),
            name: z.string().optional(),
            value: z.string().optional(),
        }),
    ).nullable().default([]),
})
type Schema = z.output<typeof schema>

const fields = props.fields
if (fields && (!fields.custom_attribute || !fields.custom_attribute.length)) {
    fields.custom_attribute = structuredClone(toRaw(unref(customAttributes.value)))
}
const state = reactive<Partial<ParticipantForm>>(fields ?? {
    name: '',
    email: '',
    phone_number: '',
    max_attendance: 0,
    custom_attribute: structuredClone(toRaw(unref(customAttributes.value))),
})

async function addData(payload: FormSubmitEvent<Schema>) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/participant`, {
            method: 'POST',
            body: {
                ...payload.data,
                custom_attribute: formatCleanCustomAttribute(payload.data.custom_attribute ?? []),
            },
        })
        if (data.success) {
            toast.add({
                title: 'Success',
                description: 'A participant has been created',
                color: 'success',
            })
            success.value = true
        }
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to create new participant',
            color: 'error',
        })
        console.error('Add participant error', error)
    }
}

async function editData(payload: FormSubmitEvent<Schema>, participantId: number) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/participant/${participantId}`, {
            method: 'PUT',
            body: {
                ...payload.data,
                custom_attribute: formatCleanCustomAttribute(payload.data.custom_attribute ?? []),
            },
        })
        if (data.success) {
            toast.add({
                title: 'Success',
                description: 'A participant has been updated',
                color: 'success',
            })
            success.value = true
        }
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to update new participant',
            color: 'error',
        })
        console.error('Edit participant error', error)
    }
}

async function submitData(payload: FormSubmitEvent<Schema>) {
    loading.value = true
    if (isCreate) {
        await addData(payload)
    }
    else {
        await editData(payload, props.participantId)
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
                label="Participant Name"
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
                label="Email"
                name="email"
                required
                class="my-2 w-full"
            >
                <UInput
                    v-model="state.email"
                    type="text"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Phone Number"
                name="phone_number"
                required
                class="my-2 w-full"
            >
                <UInput
                    v-model="state.phone_number"
                    type="text"
                    :maxlength="MAX_PHONE_NUMBER"
                    :placeholder="PHONE_NUMBER_PLACEHOLDER"
                    aria-describedby="char-count"
                    class="w-full"
                >
                    <template #trailing>
                        <div
                            id="character-count"
                            class="text-xs text-muted"
                            aria-live="polite"
                            role="status"
                        >
                            {{ state.phone_number?.length }}/{{ MAX_PHONE_NUMBER }}
                        </div>
                    </template>
                </UInput>
            </UFormField>

            <UFormField
                label="Max Attendance"
                name="max_attendance"
                class="my-2 w-full"
            >
                <UInput
                    v-model="state.max_attendance"
                    type="number"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                v-for="(item, index) in state.custom_attribute"
                :key="index"
                :label="`Custom Attribute: ${item.name}`"
                :name="`custom_attribute.${index}`"
                class="my-2 w-full"
            >
                <UInput
                    v-model="state.custom_attribute![index]!.value"
                    type="string"
                    class="w-full"
                />
            </UFormField>
        </div>
    </UForm>
</template>
