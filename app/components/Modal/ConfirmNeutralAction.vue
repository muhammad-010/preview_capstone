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
        :ui="{ footer: 'justify-end' }"
    >
        <template
            v-if="loading"
            #content
        >
            <UProgress v-model="overlay" />
        </template>

        <template #body>
            <slot>
                {{ body }}
            </slot>
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
                :label="confirmLabel || 'Yes'"
                :disabled="loading"
                @click="emit(EMIT_MODAL_CONFIRM)"
            />
        </template>
    </UModal>
</template>
