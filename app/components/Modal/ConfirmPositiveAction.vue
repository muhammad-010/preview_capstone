<script setup lang="ts">
defineProps<{
    title: string
    body?: string
    confirmLabel?: string
    loading?: boolean
}>()
const open = defineModel<boolean>('open')
const emit = defineEmits([EMIT_MODAL_CONFIRM])
const overlay = ref(null)
</script>

<template>
    <UModal
        v-model:open="open"
        :title="title"
        :ui="{ title: 'text-success', footer: 'justify-end' }"
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
                @click="close"
            />
            <UButton
                :label="confirmLabel || 'Yes, I Understand My Action'"
                color="success"
                :disabled="loading"
                @click="emit(EMIT_MODAL_CONFIRM)"
            />
        </template>
    </UModal>
</template>
