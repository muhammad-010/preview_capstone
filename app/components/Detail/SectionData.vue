<script setup lang="ts">
defineProps<{
    title: string
    subtitle?: string
    icon?: string
}>()
</script>

<template>
    <div>
        <h5 class="mb-1">
            {{ title }}
        </h5>
        <div class="flex items-center">
            <slot>
                <UIcon
                    v-if="icon"
                    :name="icon"
                />
                <span
                    class="text-toned"
                    :class="{ 'ml-2': icon }"
                >
                    {{ subtitle }}
                </span>
            </slot>
        </div>
    </div>
</template>
