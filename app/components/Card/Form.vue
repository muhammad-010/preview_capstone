<script setup lang="ts">
defineProps<{
    title?: string
    subtitle?: string
    loading?: boolean
    cancelLabel?: string
    saveLabel?: string
}>()
const emit = defineEmits([EMIT_FORM_CANCEL, EMIT_FORM_SAVE])
</script>

<template>
    <MiscLoadingOverlay :loading="loading">
        <UCard>
            <template #header>
                <h3>{{ title }}</h3>
                <small>{{ subtitle }}</small>
            </template>

            <slot />

            <template #footer>
                <div class="flex justify-end items-center">
                    <div class="flex gap-2">
                        <UButton
                            color="secondary"
                            variant="outline"
                            icon="lucide:x"
                            class="cursor-pointer"
                            @click="emit(EMIT_FORM_CANCEL)"
                        >
                            {{ cancelLabel ?? 'Cancel' }}
                        </UButton>

                        <UButton
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            @click="emit(EMIT_FORM_SAVE)"
                        >
                            {{ saveLabel ?? 'Save' }}
                        </UButton>
                    </div>
                </div>
            </template>
        </UCard>
    </MiscLoadingOverlay>
</template>
