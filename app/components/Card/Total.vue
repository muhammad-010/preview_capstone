<script setup lang="ts">
const props = defineProps<{
    title?: string
    total?: number
    icon?: string
    percentage?: boolean
    withStats?: boolean
    stats?: string
    statsStatus?: 'up' | 'down' | 'equal'
    statsText?: string
    statsTextStatus?: 'up' | 'down' | 'equal'
    formatNumber?: 'suffix' | 'currency'
    iconColor?: 'error' | 'success' | 'warning' | 'info' | 'primary'
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

function statsTextColor(
    statsTextStatus: 'up' | 'down' | 'equal' | undefined,
    statsStatus: 'up' | 'down' | 'equal' | undefined,
) {
    if (statsTextStatus) {
        switch (statsTextStatus) {
            case 'up':
                return 'text-success'
            case 'down':
                return 'text-error'
            default:
                return 'text-neutral'
        }
    }

    switch (statsStatus) {
        case 'up':
            return 'text-success'
        case 'down':
            return 'text-error'
        default:
            return 'text-neutral'
    }
}

function formatCurrency(value: number, currency?: string): string {
    const formatter = getCurrencyFormatter(currency)
    return formatter.format(value)
}

const iconColorClass = computed(() => {
    if (!props.iconColor) return 'text-neutral'

    switch (props.iconColor) {
        case 'error':
            return 'text-error'
        case 'success':
            return 'text-success'
        case 'warning':
            return 'text-warning'
        case 'info':
            return 'text-info'
        case 'primary':
            return 'text-primary'
        default:
            return 'text-neutral'
    }
})
</script>

<template>
    <UCard class="col-span-4 sm:col-span-3 md:col-span-1">
        <div class="flex justify-between">
            <div class="mb-2">
                <p>{{ title }}</p>
                <h1>
                    <span v-if="!formatNumber">{{ formatNumberSuffix(total || 0) }}</span>
                    <span v-else-if="formatNumber === 'suffix'">{{ formatNumberSuffix(total || 0) }}</span>
                    <span v-else-if="formatNumber === 'currency'">{{ formatCurrency(total || 0) }}</span>
                    {{ percentage ? ' %' : '' }}
                </h1>
            </div>

            <div v-if="icon">
                <UIcon
                    :name="icon"
                    class="size-8 ml-auto"
                    :class="`${iconColorClass}`"
                />
            </div>
        </div>

        <div
            v-if="withStats"
            class="flex items-center"
        >
            <UIcon
                :name="statsIcon(statsStatus)"
                :class="statsTextColor(statsTextStatus, statsStatus)"
                class="size-4 mr-1"
            />
            <small
                :class="statsTextColor(statsTextStatus, statsStatus)"
                class="mr-1"
            >{{ stats }}</small>
            <small>{{ statsText }}</small>
        </div>
    </UCard>
</template>
