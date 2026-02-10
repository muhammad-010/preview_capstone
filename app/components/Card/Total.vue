<script setup lang="ts">
defineProps<{
    title?: string
    total?: number
    icon?: string
    withStats?: boolean
    stats?: string
    statsStatus?: 'up' | 'down'
    statsText?: string
}>()
</script>

<template>
    <UCard class="col-span-4 sm:col-span-3 md:col-span-1">
        <div class="flex justify-between">
            <div>
                <h2 class="text-md mb-2">
                    {{ title }}
                </h2>
                <p class="text-3xl font-bold">
                    {{ useNumberSuffix(total || 0) }}
                </p>
            </div>
            <div v-if="icon">
                <UIcon
                    :name="icon"
                    class="text-neutral-500 size-8 ml-auto"
                />
            </div>
        </div>
        <div
            v-if="withStats"
            class="flex items-center mt-2"
        >
            <UIcon
                :name="statsStatus === 'up' ? 'lucide:arrow-up-right' : 'lucide:arrow-down-right'"
                :class="statsStatus === 'up' ? 'text-success' : 'text-error'"
                class="size-4 mr-1"
            />
            <small
                :class="statsStatus === 'up' ? 'text-success' : 'text-error'"
                class="mr-1"
            >{{ stats }}</small>
            <small>{{ statsText }}</small>
        </div>
    </UCard>
</template>
