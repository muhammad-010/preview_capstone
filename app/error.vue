<script setup lang="ts">
import type { NuxtError } from '#app'

definePageMeta({
    layout: 'clean',
})
defineProps<{ error: NuxtError }>()
const { redirect } = useUserState()

function errTitle(code: number) {
    switch (code) {
        case 401:
            return 'Unauthorized'
        case 403:
            return 'Access Denied'
        default:
            return 'An Error Occured'
    }
}

function errDescription(code: number) {
    switch (code) {
        case 401:
            return 'Your session has expired. Please log-in again to continue'
        case 403:
            return 'Your role does not allow access to this resource'
        default:
            return 'Please contact administrator for more info'
    }
}
</script>

<template>
    <UContainer>
        <div class="flex justify-center items-center flex-col h-[95vh] text-center">
            <div class="mb-8">
                <h1>{{ errTitle(error.statusCode || 500) }}</h1>
                <h4>{{ errDescription(error.statusCode || 500) }}</h4>
            </div>

            <UButton @click="clearError({ redirect })">
                Back to Home
            </UButton>
        </div>
    </UContainer>
</template>
