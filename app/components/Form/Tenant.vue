<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const router = useRouter()
const props = defineProps<{
    id?: number
    fields?: TenantForm
}>()

const formRef = useTemplateRef<Form<TenantForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}

function useTenantForm(id: number) {
    const isCreate = !id
    const statuses = STATUS_DROPDOWN
    const validPlans = 1 as number
    const plans = ref<{
        id: number
        label: string
    }[]>([{
        id: 1,
        label: 'Enterprise',
    }])
    const toast = useToast()
    const loading = ref(false)
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)

    const schema = z.object({
        name: z
            .string()
            .min(1, 'Tenant name is required'),
        owner_name: z
            .string()
            .min(1, 'Owner name is required'),
        owner_email: z
            .email('Invalid owner email'),
        owner_phone_number: z
            .string()
            .regex(/^\+?[0-9]{11,15}$/, 'Invalid phone number'),
        owner_password: z
            .string()
            .min(8, 'Minimum 8 characters')
            .optional(),
        owner_password_confirm: z
            .string()
            .min(8, 'Minimum 8 characters')
            .optional(),
        status: z
            .enum(STATUS_DROPDOWN),
        plan_id: z
            .literal(validPlans),
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
            const data = await $fetch('/api/tenant', {
                method: 'POST',
                body: payload.data,
            })
            if (data.success) {
                toast.add({
                    title: 'Success',
                    description: 'A tenant has been created',
                    color: 'success',
                })
                router.go(-1)
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to create new tenant',
                color: 'error',
            })
            console.error('Add tenant error', error)
        }
    }

    async function editData(payload: FormSubmitEvent<Schema>, id: number) {
        try {
            const data = await $fetch(`/api/tenant/${id}`, {
                method: 'PUT',
                body: payload.data,
            })
            if (data.success) {
                toast.add({
                    title: 'Success',
                    description: 'A tenant has been updated',
                    color: 'success',
                })
                router.go(-1)
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Failed to update new tenant',
                color: 'error',
            })
            console.error('Edit tenant error', error)
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
        plans,
        state,
        loading,
        showPassword,
        showConfirmPassword,
        schema,
        submitData,
    }
}

const {
    isCreate,
    statuses,
    plans,
    state,
    loading,
    showPassword,
    showConfirmPassword,
    schema,
    submitData,
} = useTenantForm(props.id || 0)
</script>

<template>
    <div class="my-8">
        <CardForm
            title="Tenant Information"
            subtitle="Enter the details for the new tenant organization"
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
                        label="Company Name"
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
                        label="Admin Name"
                        name="owner_name"
                        required
                        class="my-2 w-full"
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
                        class="my-2 w-full"
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
                        class="my-2 w-full"
                    >
                        <UInput
                            v-model="state.owner_phone_number"
                            type="text"
                            class="w-full"
                        />
                    </UFormField>

                    <UFormField
                        label="Admin Password"
                        name="owner_password"
                        :required="isCreate"
                        class="my-2 w-full"
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
                        class="my-2 w-full"
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
                        class="my-2 w-full"
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
                        class="my-2 w-full"
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
                        class="my-2 w-full"
                    >
                        <UInput
                            v-model="state.billingAddress"
                            type="text"
                            class="w-full"
                        />
                    </UFormField> -->
                </div>
            </UForm>
        </CardForm>
    </div>
</template>
