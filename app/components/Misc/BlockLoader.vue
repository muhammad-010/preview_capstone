<!-- eslint-disable vue/no-v-html -->
<script setup lang="ts">
const props = defineProps<{
    blockSettings: Block[]
}>()

const availableBlocks = ref<ElementBlock[]>([BLOCK_TEXT_DEFAULT])
const renderableBlocks = computed(() => {
    return props.blockSettings
        .map((saved) => {
            const base = availableBlocks.value.find(ab => ab.id === saved.id)
            if (!base) return undefined
            return blockToElementBlock(saved, base)
        })
        .filter((b): b is ElementBlock => Boolean(b))
})
</script>

<template>
    <div>
        <div
            v-for="block in renderableBlocks"
            :key="block.uid"
            :style="getAbsoluteDivStyle(block)"
            v-html="block.html(block.setting, block.compiledStyle)"
        />
    </div>
</template>
