<script setup lang="ts">
/**
 * Layers panel. Block array order is the z-order (later = on top), so the list
 * is shown top-layer-first. Supports click-select, drag-reorder, nudging order
 * with buttons, and delete.
 */
const ctx = useEditorV2Context()

function iconFor(type: string) {
    if (type === BLOCK_IMAGE_TYPE || type === BLOCK_DYNAMIC_QR_IMAGE_TYPE) return 'lucide:image'
    if (type === STATIC_BLOCK_SCANNER_QR_TYPE) return 'lucide:qr-code'
    if (type === STATIC_BLOCK_INPUT_CARD_TYPE) return 'lucide:square-mouse-pointer'
    return 'lucide:type'
}

// top layer first
const layers = computed(() =>
    ctx.blockContainer.value
        .map((block, idx) => ({ block, idx }))
        .reverse(),
)

const dragIdx = ref<number | null>(null)
function onDragStart(idx: number) {
    dragIdx.value = idx
}
function onDrop(targetIdx: number) {
    if (dragIdx.value === null || dragIdx.value === targetIdx) return
    ctx.reorder(dragIdx.value, targetIdx)
    dragIdx.value = null
}
</script>

<template>
    <UCard :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }">
        <template #header>
            <h5>Layers</h5>
        </template>

        <div
            v-if="!layers.length"
            class="text-sm text-muted"
        >
            No elements yet.
        </div>

        <div class="space-y-1 max-h-72 overflow-y-auto scrollbar">
            <div
                v-for="{ block, idx } in layers"
                :key="`${block.id}-${idx}`"
                draggable="true"
                class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer border"
                :class="ctx.isSelected(idx)
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent hover:bg-elevated'"
                @click="ctx.select(idx)"
                @dragstart="onDragStart(idx)"
                @dragover.prevent
                @drop="onDrop(idx)"
            >
                <UIcon
                    name="lucide:grip-vertical"
                    class="size-4 text-dimmed shrink-0"
                />
                <UIcon
                    :name="iconFor(block.type)"
                    class="size-4 shrink-0"
                />
                <span class="truncate grow">{{ block.label }}</span>

                <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="lucide:chevron-up"
                    :disabled="idx === ctx.blockContainer.value.length - 1"
                    @click.stop="ctx.bringForward(idx)"
                />
                <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="lucide:chevron-down"
                    :disabled="idx === 0"
                    @click.stop="ctx.sendBackward(idx)"
                />
                <UButton
                    size="xs"
                    color="error"
                    variant="ghost"
                    icon="lucide:trash-2"
                    @click.stop="ctx.removeBlock(idx)"
                />
            </div>
        </div>
    </UCard>
</template>
