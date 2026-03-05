<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()
const router = useRouter()
const { tenantId } = useUserState()
const props = defineProps<{
    id?: number
    eventId: number
    fields?: ParticipantForm
}>()
const formRef = useTemplateRef<Form<ParticipantForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}

async function useForm(tId: number, eId: number, id: number) {
    const isCreate = !id
    const toast = useToast()
    const loading = ref(false)

    const schema = z.object({
        name: zodStringRequired('Participant name is required'),
        email: zodEmailRequired(),
        phone_number: zodPhoneNumberRequired(),
    })
    type Schema = z.output<typeof schema>

    const state = reactive<Partial<ParticipantForm>>(props.fields ?? {
        name: '',
        email: '',
        phone_number: '',
    })

    async function addData(payload: FormSubmitEvent<Schema>) {
        try {
            const data = await $api(`/api/tenant/${tId}/event/${eId}/participant`, {
                method: 'POST',
                body: payload.data,
            })
            if (data.success) {
                toast.add({
                    title: 'Success',
                    description: 'A participant has been created',
                    color: 'success',
                })
                router.go(-1)
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

    async function editData(payload: FormSubmitEvent<Schema>, id: number) {
        try {
            const data = await $api(`/api/tenant/${tId}/event/${eId}/participant/${id}`, {
                method: 'PUT',
                body: payload.data,
            })
            if (data.success) {
                toast.add({
                    title: 'Success',
                    description: 'A participant has been updated',
                    color: 'success',
                })
                router.go(-1)
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
            await editData(payload, id)
        }
        loading.value = false
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
    loading,
    schema,
    state,
    submitData,
} = await useForm(tenantId.value, props.eventId, props.id || 0)
</script>

<template>
    <div class="my-8">
        <CardForm
            title="Participant Information"
            subtitle="Enter the details for the new participant"
            :loading="loading"
            @cancel="router.back()"
            @save="saveData"
        >
            <UForm
                ref="formRef"
                :schema="schema"
                :state="state"
                @submit.prevent="submitData"
            >
                <div class="grid md:grid-cols-2 gap-6">
                    <UFormField
                        label="Participant Name"
                        name="name"

                        required
                        class="my-2 w-full col-span-2"
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
                            class="w-full"
                        />
                    </UFormField>
                </div>
            </UForm>
        </CardForm>
    </div>
</template>
