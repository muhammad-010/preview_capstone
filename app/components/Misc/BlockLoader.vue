<!-- eslint-disable vue/no-v-html -->
<script setup lang="ts">
const props = defineProps<{
    blockSettings: ElementBlock[]
}>()

const availableBlocks = ref<ElementBlock[]>([BLOCK_TEXT_DEFAULT])
const renderableBlocks = computed(() => {
    return props.blockSettings
        .map((saved) => {
            const base = availableBlocks.value.find(ab => ab.id === saved.id)
            if (!base) return undefined
            return saved
        })
        .filter((b): b is ElementBlock => Boolean(b))
})
const responsivePosition = computed(() =>
    renderableBlocks.value.map(b => getResponsivePositionStyle(b)),
)
</script>

<template>
    <div>
        <div
            v-for="(block, idx) in renderableBlocks"
            :key="`${block.id}-${idx}`"
            :class="responsivePosition[idx]!.tailwindClass"
            :style="responsivePosition[idx]!.style"
            v-html="renderHtmlBlock(block)"
        />
    </div>
</template>

