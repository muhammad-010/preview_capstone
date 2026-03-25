<script setup lang="ts">
defineProps<{
    message: string
}>()
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
    <UModal v-model:open="open">
        <template #content>
            <div class="flex flex-col justify-center items-center text-center p-12">
                <UIcon
                    name="lucide:circle-x"
                    class="text-error size-32 mb-8"
                />
                <div class="mb-6">
                    <h2>
                        {{ message }}
                    </h2>
                </div>
                <h5>Please check your QR Code or Phone Number and try again.</h5>
            </div>
        </template>
    </UModal>
</template>
