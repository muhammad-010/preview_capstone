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
            saved.html = base.html
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
            v-for="(block, id) in renderableBlocks"
            :key="block.uid"
            :class="responsivePosition[id]!.tailwindClass"
            :style="responsivePosition[id]!.style"
            v-html="block.html(block.setting, block.compiledStyle, block.value)"
        />
    </div>
</template>
