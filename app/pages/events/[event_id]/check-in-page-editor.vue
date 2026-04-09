<script setup lang="ts">
const customBlocks = ref([
    BLOCK_TEXT_DEFAULT,
])
const staticBlocks = ref([
    STATIC_BLOCK_QR_CODE,
    STATIC_BLOCK_INPUT_CARD,
])

definePageMeta({
    layout: 'clean',
})
</script>

<template>
    <EditorDragNDrop
        :editor-mode="EDITOR_MODE_CHECK_IN_PAGE"
        :custom-blocks="customBlocks"
        :static-blocks="staticBlocks"
        :html-preview-fn="checkInPageHtml"
        :default-orientation="EDITOR_CANVAS_PORTRAIT"
        :canvas-size-options="CANVAS_SIZE_PRESETS_CHECK_IN_PAGE"
        default-canvas-size="1024x768 (Tablet)"
        rotateable
        with-preview
        preview-path="/check-in-preview"
        :preview-key="PREVIEW_EDITOR_CHECK_IN_PAGE"
        page-title="Check In Page Key Visual Editor"
        :default-scale="0.60"
    />
</template>
