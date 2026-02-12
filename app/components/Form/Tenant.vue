<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const router = useRouter()
const props = defineProps<{
    fields?: DummyTenant
}>()
const validPlans = [1, 2, 3]
const statuses = STATUS_DROPDOWN
const state = reactive<DummyTenant>(props.fields ?? {
    tenantName: '',
    adminEmail: '',
    adminName: '',
    adminPhone: '',
    adminPassword: '',
    confirmPassword: '',
    status: 'active',
    planId: 3,
    billingAddress: '',
})
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const formRef = ref<Form<DummyTenant> | null>(null)
const schema = z.object({
    tenantName: z.string().min(1, 'Tenant name is required'),
    adminEmail: z.email('Invalid admin email'),
    adminName: z.string().min(1, 'Admin name is required'),
    adminPassword: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string().min(8, 'Minimum 8 characters'),
    status: z.literal(STATUS_DROPDOWN),
    planId: z.literal(validPlans),
}).refine(
    data => data.adminPassword === data.confirmPassword,
    { message: 'Password mismatch', path: ['confirmPassowrd'] },
)
type Schema = z.output<typeof schema>

const plans = ref<{
    id: number
    label: string
}[]>([
    {
        id: 1,
        label: 'starter',
    },
    {
        id: 2,
        label: 'professional',
    },
    {
        id: 3,
        label: 'enterprise',
    },

])

function onSave() {
    formRef.value?.submit()
}
function onSubmit(payload: FormSubmitEvent<Schema>) {
    console.log('Submitted', payload)
}
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
                            v-model="state.tenantName"
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
                            v-model="state.adminName"
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
                            v-model="state.adminEmail"
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
                            v-model="state.adminPhone"
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
                            v-model="state.adminPassword"
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
                            v-model="state.confirmPassword"
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
                        class="my-2 w-full"
                    >
                        <UInputMenu
                            v-model="state.planId"
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

                    <UFormField
                        label="Billing Address"
                        name="billingAddress"
                        class="my-2 w-full"
                    >
                        <UInput
                            v-model="state.billingAddress"
                            type="text"
                            class="w-full"
                        />
                    </UFormField>
                </div>
            </UForm>
        </CardForm>
    </div>
</template>
