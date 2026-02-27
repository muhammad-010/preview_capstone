<script setup lang="ts">
defineProps<{
    name?: string
    logo?: string
    collapsed?: boolean
}>()
</script>

<template>
    <div class="flex justify-center items-center w-full">
        <NuxtImg
            :src="logo ?? '/logo.png'"
            :width="200"
            class="mt-2"
        />
        <!-- <Transition name="fade">
            <p
                v-if="!collapsed"
                class="text-neutral-50 font-bold text-lg ml-2"
            >
                {{ name }}
            </p>
        </Transition> -->
    </div>
</template>
