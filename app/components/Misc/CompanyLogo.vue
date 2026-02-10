<script setup lang="ts">
defineProps<{
    name?: string
    logo?: string
    collapsed?: boolean
}>()
</script>

<template>
    <div class="flex items-center">
        <NuxtImg
            :src="logo ?? '/logo.png'"
            width="40"
            height="40"
            class="mr-2"
        />
        <Transition name="fade">
            <p
                v-if="!collapsed"
                class="text-secondary-50 font-bold text-lg ml-2"
            >
                {{ name }}
            </p>
        </Transition>
    </div>
</template>
