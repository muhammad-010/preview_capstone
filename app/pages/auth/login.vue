<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

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

    const { fetch: refreshSession } = useUserSession()
    return {
        fields,
        schema,
        refreshSession,
    }
}

async function onLogin(payload: FormSubmitEvent<Schema>) {
    const { data } = await useFetch('/api/auth/login', {
        method: 'POST',
        body: payload.data,
    })
    await refreshSession()
    if (data.value?.redirect) {
        await navigateTo(data.value?.redirect)
    }
    else {
        await navigateTo('/')
    }
}

const {
    fields,
    schema,
    refreshSession,
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
    <UPageCard class="p-4 pt-2 w-full max-w-md">
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
