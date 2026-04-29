<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
const props = defineProps<{
    tenantId: number
    userId?: number
    fields?: UserForm
    isModal?: boolean
}>()
const loading = defineModel<boolean>('loading', { default: false })
const success = defineModel<boolean>('success', { default: false })
const formRef = useTemplateRef<Form<UserForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}
defineExpose({ saveData })

const isCreate = !props.userId
const statuses = STATUS_DROPDOWN
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
        const data = await $api(`/api/tenant/${props.tenantId}/user`, {
            method: 'POST',
            body: payload.data,
        })
        if (data.success) {
            successToast({ description: 'A member has been created' })
            success.value = true
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to create new member' })
    }
}

async function editData(payload: FormSubmitEvent<Schema>, userId: number) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/user/${userId}`, {
            method: 'PUT',
            body: payload.data,
        })
        if (data.success) {
            successToast({ description: 'A member has been updated' })
            success.value = true
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to update new member' })
    }
}

async function submitData(payload: FormSubmitEvent<Schema>) {
    loading.value = true
    if (isCreate) {
        await addData(payload)
    }
    else {
        await editData(payload, props.userId)
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
                label="Member Name"
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
                label="Email"
                name="email"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
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
                :class="`${isModal ? '' : 'my-2'} w-full`"
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
                label="Account Status"
                name="status"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
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
                :class="`${isModal ? '' : 'my-2'} w-full`"
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
                :class="`${isModal ? '' : 'my-2'} w-full`"
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
</template>
