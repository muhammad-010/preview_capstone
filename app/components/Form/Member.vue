<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()
const router = useRouter()
const { tenantId } = useUserState()
const props = defineProps<{
    id?: number
    fields?: UserForm
}>()
const formRef = useTemplateRef<Form<UserForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}

async function useUserForm(tId: number, id: number) {
    const isCreate = !id
    const statuses = STATUS_DROPDOWN
    const toast = useToast()
    const loading = ref(false)
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)

    const schema = z.object({
        name: zodStringRequired('Member name is required'),
        email: zodEmailRequired(),
        phone_number: zodPhoneNumberRequired(),
        password: zodPasswordOptional(),
        password_confirm: zodPasswordOptional(),
        status: zodEnum(STATUS_DROPDOWN),
        tenant_role_id: zodNumberOptional(),
    }).superRefine((data, ctx) => {
        if (isCreate) {
            if (!data.password) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Password is required',
                    path: ['password'],
                })
            }
            if (!data.password_confirm) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Confirm password is required',
                    path: ['password_confirm'],
                })
            }
        }
        if (data.password || data.password_confirm) {
            if (data.password !== data.password_confirm) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Password mismatch',
                    path: ['password_confirm'],
                })
            }
        }
    })
    type Schema = z.output<typeof schema>

    const state = reactive<Partial<UserForm>>(props.fields ?? {
        name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirm: '',
        status: 'Active',
        tenant_role_id: 0,
    })

    async function addData(payload: FormSubmitEvent<Schema>) {
        try {
            const data = await $api(`/api/tenant/${tId}/user`, {
                method: 'POST',
                body: payload.data,
            })
            if (data.success) {
                toast.add({
                    title: 'Success',
                    description: 'A member has been created',
                    color: 'success',
                })
                router.go(-1)
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to create new member',
                color: 'error',
            })
            console.error('Add member error', error)
        }
    }

    async function editData(payload: FormSubmitEvent<Schema>, id: number) {
        try {
            const data = await $api(`/api/tenant/${tId}/user/${id}`, {
                method: 'PUT',
                body: payload.data,
            })
            if (data.success) {
                toast.add({
                    title: 'Success',
                    description: 'A member has been updated',
                    color: 'success',
                })
                router.go(-1)
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to update new member',
                color: 'error',
            })
            console.error('Edit member error', error)
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
        statuses,
        loading,
        showPassword,
        showConfirmPassword,
        schema,
        state,
        submitData,
    }
}

const {
    isCreate,
    statuses,
    loading,
    showPassword,
    showConfirmPassword,
    schema,
    state,
    submitData,
} = await useUserForm(tenantId.value, props.id || 0)
</script>

<template>
    <div class="my-8">
        <CardForm
            title="Member Information"
            subtitle="Enter the details for the new member"
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
                        label="Member Name"
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
                        label="Account Status"
                        name="status"
                        required
                        class="my-2 w-full"
                    >
                        <UInputMenu
                            v-model="state.status"
                            :items="statuses"
                            class="w-full"
                        />
                    </UFormField>

                    <UFormField
                        label="Admin Password"
                        name="password"
                        :required="isCreate"
                        class="my-2 w-full"
                    >
                        <UInput
                            v-model="state.password"
                            :placeholder="!isCreate ? 'Leave blank to keep current' : ''"
                            :type="showPassword ? 'text' : 'password'"
                            class="w-full"
                        >
                            <template #trailing>
                                <UButton
                                    color="neutral"
                                    variant="link"
                                    size="sm"
                                    :icon="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
                                    :aria-label="showPassword ? 'Hide password' : 'Show password'"
                                    :aria-pressed="showPassword"
                                    aria-controls="password"
                                    @click="showPassword = !showPassword"
                                />
                            </template>
                        </UInput>
                    </UFormField>

                    <UFormField
                        label="Confirm Password"
                        name="password_confirm"
                        :required="isCreate"
                        class="my-2 w-full"
                    >
                        <UInput
                            v-model="state.password_confirm"
                            :placeholder="!isCreate ? 'Leave blank to keep current' : ''"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            class="w-full"
                        >
                            <template #trailing>
                                <UButton
                                    color="neutral"
                                    variant="link"
                                    size="sm"
                                    :icon="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'"
                                    :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                                    :aria-pressed="showConfirmPassword"
                                    aria-controls="password"
                                    @click="showConfirmPassword = !showConfirmPassword"
                                />
                            </template>
                        </UInput>
                    </UFormField>
                </div>
            </UForm>
        </CardForm>
    </div>
</template>
