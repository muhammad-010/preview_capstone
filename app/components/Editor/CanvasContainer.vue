<script setup lang="ts">
defineProps<{
    width: string
    height: string
}>()
</script>

<template>
    <div
        :class="`border border-neutral-950/25 dark:border-neutral-50/25 rounded overflow-hidden`"
        :style="{ width, height }"
    >
        <slot name="default" />
    </div>
</template>
