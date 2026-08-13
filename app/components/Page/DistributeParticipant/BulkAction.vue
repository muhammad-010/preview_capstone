<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
    selected: boolean
}>()
const emit = defineEmits([EMIT_TABLE_DISTRIBUTE])
const bulkActionList: DropdownMenuItem[][] = [
    [
        {
            label: 'Distribute',
            icon: 'lucide:send',
            onSelect() {
                emit(EMIT_TABLE_DISTRIBUTE)
            },
        },
    ],
]
</script>

<template>
    <div>
        <UDropdownMenu
            :disabled="!selected"
            :items="bulkActionList"
            :ui="{ content: 'min-w-48', item: 'cursor-pointer' }"
        >
            <UButton
                label="Bulk Action"
                class="w-46"
                color="neutral"
                variant="subtle"
                block
                trailing-icon="lucide:chevron-down"
            />
        </UDropdownMenu>
    </div>
</template>
