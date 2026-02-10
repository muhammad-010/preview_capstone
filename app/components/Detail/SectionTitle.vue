<script setup lang="ts">
defineProps<{
    title: string
    withSeparator?: boolean
}>()
</script>

<template>
    <div>
        <h3
            class="text-lg text-highlighted"
            :class="{ 'mb-6': !withSeparator }"
        >
            {{ title }}
        </h3>
        <USeparator
            v-if="withSeparator"
            size="lg"
            class="mt-2 mb-6"
        />
    </div>
</template>
