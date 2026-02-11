<script setup lang="ts">
defineProps<{
    title: string
    withSeparator?: boolean
}>()
</script>

<template>
    <div>
        <h4
            class="text-highlighted"
            :class="{ 'mb-6': !withSeparator }"
        >
            {{ title }}
        </h4>
        <USeparator
            v-if="withSeparator"
            size="lg"
            class="mt-2 mb-6"
        />
    </div>
</template>
