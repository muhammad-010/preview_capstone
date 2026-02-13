<script setup lang="ts">
defineProps<{
    title?: string
    total?: number
    icon?: string
    withStats?: boolean
    stats?: string
    statsStatus?: 'up' | 'down' | 'equal'
    statsText?: string
}>()

function statsIcon(statsStatus: 'up' | 'down' | 'equal' | undefined) {
    switch (statsStatus) {
        case 'up':
            return 'lucide:arrow-up-right'
        case 'down':
            return 'lucide:arrow-down-right'
        default:
            return 'lucide:equal'
    }
}

function statsTextColor(statsStatus: 'up' | 'down' | 'equal' | undefined) {
    switch (statsStatus) {
        case 'up':
            return 'text-success'
        case 'down':
            return 'text-error'
        default:
            return 'text-neutral'
    }
}
</script>

<template>
    <UCard class="col-span-4 sm:col-span-3 md:col-span-1">
        <div class="flex justify-between">
            <div class="mb-2">
                <p>{{ title }}</p>
                <h1>{{ formatNumberSuffix(total || 0) }}</h1>
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
                :name="statsIcon(statsStatus)"
                :class="statsTextColor(statsStatus)"
                class="size-4 mr-1"
            />
            <small
                :class="statsTextColor(statsStatus)"
                class="mr-1"
            >{{ stats }}</small>
            <small>{{ statsText }}</small>
        </div>
    </UCard>
</template>
