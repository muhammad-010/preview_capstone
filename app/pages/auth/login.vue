<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

useHead({
    title: 'Login',
})
definePageMeta({
    layout: 'auth',
})

const fields = ref<AuthFormField[]>([
    {
        name: 'email',
        type: 'text',
        label: 'Email',
        required: true,
        placeholder: 'Enter your email',
    },
    {
        name: 'password',
        type: 'password',
        label: 'Password',
        required: true,
        placeholder: 'Enter your password',
    },
])

const schema = z.object({
    email: z.email('Invalid email'),
    password: z.string('Password is required'),
})
type Schema = z.output<typeof schema>
function onLogin(payload: FormSubmitEvent<Schema>) {
    console.log('Submitted', payload)
}
</script>

<template>
    <UPageCard class="p-4 pt-2 w-full max-w-md">
        <UAuthForm
            :schema="schema"
            :fields="fields"
            @submit="onLogin"
        >
            <template #submit>
                <div class="flex justify-between items-center mb-5">
                    <UCheckbox
                        label="Remember Me"
                        name="remember"
                    />
                    <ULink
                        to="/"
                        class="text-sm"
                    >
                        Forgot your password?
                    </ULink>
                </div>

                <!-- <UButton
                    type="submit"
                    color="primary"
                    icon="lucide:log-in"
                    class="w-full"
                >
                    Sign In
                </UButton> -->
                <UButton
                    to="/dashboard"
                    color="primary"
                    icon="lucide:log-in"
                    class="w-full"
                >
                    Sign In
                </UButton>
            </template>
        </UAuthForm>
    </UPageCard>
</template>
