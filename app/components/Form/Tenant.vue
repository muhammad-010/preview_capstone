<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const router = useRouter()
const props = defineProps<{
    id?: number
    fields?: TenantForm
}>()

function useTenantForm() {
    const statuses = STATUS_DROPDOWN
    const validPlans = [1]
    const plans = ref<{
        id: number
        label: string
    }[]>([{
        id: 1,
        label: 'Enterprise',
    }])
    const state = reactive<TenantForm>(props.fields ?? {
        name: '',
        owner_name: '',
        owner_email: '',
        owner_phone_number: '',
        owner_password: '',
        owner_password_confirm: '',
        plan_id: 1,
        status: 'Active',
    })
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)

    const formRef = ref<Form<TenantForm> | null>(null)
    const schema = z.object({
        name: z.string()
            .min(1, 'Tenant name is required'),
        owner_name: z.string()
            .min(1, 'Owner name is required'),
        owner_email: z.email('Invalid owner email'),
        owner_phone_number: z.string()
            .regex(/^\+?[0-9]{8,15}$/, 'Invalid phone number')
            .optional(),
        owner_password: props.id
            ? z.string().min(8, 'Minimum 8 characters').optional()
            : z.string().min(8, 'Minimum 8 characters'),
        owner_password_confirm: props.id
            ? z.string().min(8, 'Minimum 8 characters').optional()
            : z.string().min(8, 'Minimum 8 characters'),
        status: z.literal(STATUS_DROPDOWN),
        plan_id: z.literal(validPlans),
    }).refine(
        data => data.owner_password === data.owner_password_confirm,
        { message: 'Password mismatch', path: ['owner_password_confirm'] },
    )

    return {
        statuses,
        plans,
        state,
        showPassword,
        showConfirmPassword,
        formRef,
        schema,
    }
}

function onSave() {
    formRef.value?.submit()
}

async function addData(payload: FormSubmitEvent<Schema>) {
    try {
        const data = await $fetch('/api/tenant', {
            method: 'POST',
            body: payload.data,
        })
        if (data.success) {
            router.go(-1)
        }
    }
    catch (error) {
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
            router.go(-1)
        }
    }
    catch (error) {
        console.error('Edit tenant error', error)
    }
}

async function onSubmit(payload: FormSubmitEvent<Schema>) {
    if (props.id && props.id > 0) {
        await editData(payload, props.id)
    }
    else {
        await addData(payload)
    }
}

const {
    statuses,
    plans,
    state,
    showPassword,
    showConfirmPassword,
    formRef,
    schema,
} = useTenantForm()
type Schema = z.output<typeof schema>
</script>

<template>
    <div class="my-8">
        <CardForm
            title="Tenant Information"
            subtitle="Enter the details for the new tenant organization"
            @cancel="router.back()"
            @save="onSave"
        >
            <UForm
                ref="formRef"
                :schema="schema"
                :state="state"
                @submit="onSubmit"
            >
                <div class="grid md:grid-cols-2 gap-6">
                    <UFormField
                        label="Company Name"
                        name="tenantName"
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
                        name="adminName"
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
                        name="adminEmail"
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
                        name="adminPhone"
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
                        name="adminPassword"
                        required
                        class="my-2 w-full"
                    >
                        <UInput
                            v-model="state.owner_password"
                            :type="showPassword ? 'text' : 'password'"
                            class="w-full"
                        >
                            <template #trailing>
                                <UButton
                                    color="secondary"
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
                        name="confirmPassword"
                        required
                        class="my-2 w-full"
                    >
                        <UInput
                            v-model="state.owner_password_confirm"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            class="w-full"
                        >
                            <template #trailing>
                                <UButton
                                    color="secondary"
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
