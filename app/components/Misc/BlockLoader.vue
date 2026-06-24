<!-- eslint-disable vue/no-v-html -->
<script setup lang="ts">
const props = defineProps<{
    blockSettings: ElementBlock[]
    dynamicBlocks?: ElementBlock[]
    validFonts?: TemplateFont[]
}>()

const availableBlocks = ref<ElementBlock[]>([
    BLOCK_TEXT_DEFAULT,
    ...(props.dynamicBlocks ? props.dynamicBlocks : []),
])
const renderableBlocks = computed(() => {
    return props.blockSettings
        .map((saved) => {
            const base = availableBlocks.value.find(ab => ab.type === saved.type)
            if (!base) return undefined
            return saved
        })
        .filter((b): b is ElementBlock => Boolean(b))
})
const responsivePosition = computed(() =>
    renderableBlocks.value.map(b => getResponsivePositionStyle(b)),
)

watch(
  () => renderableBlocks.value,
  () => {
    const usedFonts = getUsedFonts(renderableBlocks.value)

    useHead({
      style: [
        {
          key: 'dynamic-font-faces',
          textContent: generateFontFaceRules(
            props.validFonts || [],
            usedFonts,
          ),
        },
      ],
    })
  },
  { deep: true, immediate: true },
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
