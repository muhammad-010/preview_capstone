<script setup lang="ts">
defineProps<{
    label?: string
    draggable?: boolean
    hoverable?: boolean
}>()
</script>

<template>
    <div
        class="
            py-2 px-4
            border border-neutral-950/25 dark:border-neutral-50/25
            text-sm
            rounded w-52
        "
        :class="[
            hoverable ? 'hover:bg-neutral-100 dark:hover:bg-neutral-950' : '',
        ]"
        :draggable="draggable"
    >
        <slot name="default">
            {{ label }}
        </slot>
    </div>
</template>
