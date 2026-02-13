<script setup lang="ts">
</script>

<template>
    <UCard
        class="mb-8"
        :ui="{
            root: 'ring-error',
        }"
    >
        <template #header>
            <div class="flex justify-between items-center">
                <h3 class="text-error">
                    Danger Zone
                </h3>
            </div>
        </template>

        <slot />
    </UCard>
</template>
