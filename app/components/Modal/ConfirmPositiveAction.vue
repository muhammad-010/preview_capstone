<script setup lang="ts">
defineProps<{
    title: string
    body?: string
    confirmLabel?: string
}>()
const open = defineModel<boolean>('open')
const emit = defineEmits([EMIT_MODAL_CONFIRM])
</script>

<template>
    <UModal
        v-model:open="open"
        :title="title"
        :ui="{ title: 'text-success', footer: 'justify-end' }"
    >
        <template #body>
            {{ body }}
        </template>

        <template #footer="{ close }">
            <UButton
                label="Cancel"
                color="neutral"
                variant="outline"
                @click="close"
            />
            <UButton
                :label="confirmLabel || 'Yes, I Understand My Action'"
                color="success"
                @click="emit(EMIT_MODAL_CONFIRM)"
            />
        </template>
    </UModal>
</template>
