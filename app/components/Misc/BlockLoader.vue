<!-- eslint-disable vue/no-v-html -->
<script setup lang="ts">
const props = defineProps<{
    blockSettings: SavedBlockSettings[]
}>()

const BLOCK_TEXT_DEFAULT: Block = {
    uid: '',
    id: 'text',
    label: 'Text',
    data: [{ key: 'text', label: 'Text', value: 'Hello World' }],
    style: [
        { key: 'textColor', label: 'Text Color', type: 'color', value: '#000000' },
        { key: 'fontFamily', label: 'Font Family', type: 'select', value: 'Arial', options: ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'] },
        { key: 'fontSans', label: 'Sans Serif Fallback', type: 'checkbox', value: true },
        { key: 'fontSize', label: 'Font Size', type: 'number', value: '1' },
        { key: 'fontBold', label: 'Bold', type: 'checkbox', value: false },
        { key: 'fontItalic', label: 'Italic', type: 'checkbox', value: false },
    ],
    portraitPos: {
        x: 0,
        y: 0,
    },
    landscapePos: {
        x: 0,
        y: 0,
    },
    compiledStyle: 'color: #000000; font-family: Arial, sans-serif; font-size: 1rem; font-weight: normal; font-style: normal;',
    html: (data: BlockData[], compiledStyle: string) => {
        return `<p style="${compiledStyle}">${data.find(d => d.key === 'text')?.value || ''}</p>`
    },
    editableData: true,
}

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
