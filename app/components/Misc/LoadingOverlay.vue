<script setup lang="ts">
defineProps<{
    loading: boolean
}>()
const overlay = ref(null)
</script>

<template>
    <div class="relative">
        <Transition name="fade">
            <div
                v-if="loading"
                class="absolute inset-0 z-20 bg-primary-950/75 flex items-center justify-center"
            >
                <UProgress
                    v-model="overlay"
                    class="px-32"
                />
            </div>
        </Transition>

        <slot />
    </div>
</template>
