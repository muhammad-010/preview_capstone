<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
const props = defineProps<{
    tenantId?: number
    fields?: TenantForm
    isModal?: boolean
}>()
const loading = defineModel<boolean>('loading', { default: false })
const success = defineModel<boolean>('success', { default: false })
const formRef = useTemplateRef<Form<TenantForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}
defineExpose({ saveData })

const isCreate = !props.tenantId
const statuses = STATUS_DROPDOWN
const validPlans = 1 as number
const plans = ref<{
    id: number
    label: string
}[]>([{
    id: 1,
    label: 'Enterprise',
}])
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const schema = z.object({
    name: zodStringRequired('Tenant name is required'),
    owner_name: zodStringRequired('Owner name is required'),
    owner_email: zodEmailRequired(),
    owner_phone_number: zodPhoneNumberRequired(),
    owner_password: zodPasswordOptional(),
    owner_password_confirm: zodPasswordOptional(),
    status: zodEnum(STATUS_DROPDOWN),
    plan_id: z.literal(validPlans),
}).superRefine((data, ctx) => {
    if (isCreate) {
        if (!data.owner_password) {
            ctx.addIssue({
                code: 'custom',
                message: 'Password is required',
                path: ['owner_password'],
            })
        }
        if (!data.owner_password_confirm) {
            ctx.addIssue({
                code: 'custom',
                message: 'Confirm password is required',
                path: ['owner_password_confirm'],
            })
        }
    }
    if (data.owner_password || data.owner_password_confirm) {
        if (data.owner_password !== data.owner_password_confirm) {
            ctx.addIssue({
                code: 'custom',
                message: 'Password mismatch',
                path: ['owner_password_confirm'],
            })
        }
    }
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<TenantForm>>(props.fields ?? {
    name: '',
    owner_name: '',
    owner_email: '',
    owner_phone_number: '',
    owner_password: '',
    owner_password_confirm: '',
    plan_id: 1,
    status: 'Active',
})

async function addData(payload: FormSubmitEvent<Schema>) {
    try {
        const data = await $api('/api/tenant', {
            method: 'POST',
            body: payload.data,
        })
        if (data.success) {
            successToast({ description: 'A tenant has been created' })
            success.value = true
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to create new tenant' })
    }
}

async function editData(payload: FormSubmitEvent<Schema>, id: number) {
    try {
        const data = await $api(`/api/tenant/${id}`, {
            method: 'PUT',
            body: payload.data,
        })
        if (data.success) {
            successToast({ description: 'A tenant has been updated' })
            success.value = true
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to update new tenant' })
    }
}

async function submitData(payload: FormSubmitEvent<Schema>) {
    loading.value = true
    if (isCreate) {
        await addData(payload)
    }
    else {
        await editData(payload, props.tenantId)
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
                label="Company Name"
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
                label="Admin Name"
                name="owner_name"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInput
                    v-model="state.owner_name"
                    type="text"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Admin Email"
                name="owner_email"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInput
                    v-model="state.owner_email"
                    type="text"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Phone Number"
                name="owner_phone_number"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInput
                    v-model="state.owner_phone_number"
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
                            {{ state.owner_phone_number?.length }}/{{ MAX_PHONE_NUMBER }}
                        </div>
                    </template>
                </UInput>
            </UFormField>

            <UFormField
                label="Admin Password"
                name="owner_password"
                :required="isCreate"
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInput
                    v-model="state.owner_password"
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
                name="owner_password_confirm"
                :required="isCreate"
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInput
                    v-model="state.owner_password_confirm"
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

            <UFormField
                label="Select Plan"
                name="plan"
                required
                readonly
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInputMenu
                    v-model="state.plan_id"
                    value-key="id"
                    :items="plans"
                    class="w-full"
                />
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

            <!-- <UFormField
                        label="Billing Address"
                        name="billingAddress"
                        :class="`${isModal ? '' : 'my-2'} w-full`"
                    >
                        <UInput
                            v-model="state.billingAddress"
                            type="text"
                            class="w-full"
                        />
                    </UFormField> -->
        </div>
    </UForm>
</template>
