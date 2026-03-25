<script setup lang="ts">
defineProps<{
    event: string
    participant: string
}>()
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
    <UModal v-model:open="open">
        <template #content>
            <div class="flex flex-col justify-center items-center text-center p-12">
                <slot name="image">
                    <UIcon
                        name="lucide:circle-check"
                        class="text-success size-32 mb-8"
                    />
                </slot>
                <div class="mb-6">
                    <h2>
                        Welcome to {{ event }}, {{ participant }}!
                    </h2>
                </div>
                <h5>We’re excited to have you join us.</h5>
                <h5>Enjoy the event, and don’t forget to connect with new friends!</h5>
            </div>
        </template>
    </UModal>
</template>
