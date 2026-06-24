<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
    selected: boolean
}>()
const emit = defineEmits([EMIT_TABLE_EXPORT, EMIT_TABLE_PRINT_QR, EMIT_TABLE_SEND_QR, EMIT_TABLE_SEND_CERTIFICATE, EMIT_TABLE_BULK_DELETE])
const bulkActionList: DropdownMenuItem[][] = [
    [
        {
            label: 'Export',
            icon: 'lucide:download',
            onSelect() {
                emit(EMIT_TABLE_EXPORT)
            },
        },
    ],
    [
        {
            label: 'Print QR',
            icon: 'lucide:qr-code',
            onSelect() {
                emit(EMIT_TABLE_PRINT_QR)
            },
        },
        {
            label: 'Send QR',
            icon: 'lucide:send',
            onSelect() {
                emit(EMIT_TABLE_SEND_QR)
            },
        },
    ],
    [
        {
            label: 'Send Certificate',
            icon: 'lucide:scroll-text',
            onSelect() {
                emit(EMIT_TABLE_SEND_CERTIFICATE)
            },
        },
    ],
    [
        {
            label: 'Bulk Delete',
            color: 'error',
            icon: 'lucide:trash',
            onSelect() {
                emit(EMIT_TABLE_BULK_DELETE)
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
