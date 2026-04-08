<!-- eslint-disable vue/no-v-html -->
<script setup lang="ts">
const props = defineProps<{
    blockSettings: SavedBlockSettings[]
}>()

const availabelBlocks = ref<Block[]>([BLOCK_TEXT_DEFAULT])
const renderableBlocks = computed(() => {
    return props.blockSettings
        .map((saved) => {
            const base = availabelBlocks.value.find(ab => ab.id === saved.id)
            if (!base) return undefined

            return {
                ...base,

                data: saved.data,
                style: saved.style,
                compiledStyle: saved.compiledStyle,
                portraitPos: saved.portraitPos,
                landscapePos: saved.landscapePos,
            } as Block
        })
        .filter((b): b is Block => Boolean(b))
})
const isMobile = ref(false)

onMounted(() => {
    const media = window.matchMedia('(max-width: 1024px)')

    const update = () => (isMobile.value = media.matches)
    update()

    media.addEventListener('change', update)
})

function getBlockStyle(block: Block) {
    if (!import.meta.client) return ''
    if (!block) return ''

    const pos = isMobile.value
        ? block.portraitPos
        : block.landscapePos

    return `
        position: absolute;
        left: ${pos.x}%;
        top: ${pos.y}%;
        transform: translate(-50%, -50%);
    `
}
</script>

<template>
    <div>
        <div
            v-for="block in renderableBlocks"
            :key="block.uid"
            :style="getBlockStyle(block)"
            v-html="block.html(block.data, block.compiledStyle)"
        />
    </div>
</template>
