<script setup lang="ts">
defineProps<{
    title: string
    body?: string
    confirmLabel?: string
    loading?: boolean
}>()
const open = defineModel<boolean>('open')
const emit = defineEmits([EMIT_MODAL_CONFIRM, EMIT_MODAL_CANCEL])
const overlay = ref(null)
</script>

<template>
    <UModal
        v-model:open="open"
        :title="title"
        :ui="{ title: 'text-error', footer: 'justify-end' }"
    >
        <template
            v-if="loading"
            #content
        >
            <UProgress v-model="overlay" />
        </template>

        <template #body>
            {{ body }}
        </template>

        <template #footer="{ close }">
            <UButton
                label="Cancel"
                color="neutral"
                variant="outline"
                :disabled="loading"
                @click="() => {
                    close()
                    emit(EMIT_MODAL_CANCEL)
                }"
            />
            <UButton
                :label="confirmLabel || 'Yes, I Understand The Risk'"
                color="error"
                :disabled="loading"
                @click="emit(EMIT_MODAL_CONFIRM)"
            />
        </template>
    </UModal>
</template>
