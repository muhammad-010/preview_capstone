<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()

function useLogin() {
    const fields = ref<AuthFormField[]>([
        {
            name: 'identity',
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
        identity: z.email('Invalid email'),
        password: z.string('Password is required'),
    })
    const toast = useToast()
    const { fetch: refreshSession } = useUserSession()

    async function onLogin(payload: FormSubmitEvent<Schema>) {
        try {
            await $api('/api/auth/login', {
                method: 'POST',
                body: payload.data,
            })
            await refreshSession()
            const { redirect } = useUserState()
            if (redirect) {
                await navigateTo(redirect.value)
            }
            else {
                await navigateTo('/')
            }
        }
        catch (error) {
            toast.add({
                title: 'Error',
                description: 'Login failed',
                color: 'error',
            })
            console.error('Login error', error)
        }
    }

    return {
        fields,
        schema,
        onLogin,
    }
}

const {
    fields,
    schema,
    onLogin,
} = useLogin()
type Schema = z.output<typeof schema>

useHead({
    title: 'Login',
})
definePageMeta({
    layout: 'auth',
})
</script>

<template>
    <UPageCard
        class="p-4 pt-2 w-full max-w-md"
        style="width: 100%; max-width: 28rem;"
    >
        <UAuthForm
            :schema="schema"
            :fields="fields"
            @submit.prevent="onLogin"
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

                <UButton
                    type="submit"
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
