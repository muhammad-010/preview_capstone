<script setup lang="ts">
const route = useRoute()
const eventId = Number(route.params.event_id)
const customBlocks = ref([
    BLOCK_TEXT_DEFAULT,
])
const staticBlocks = ref([
    STATIC_BLOCK_SCANNER_QR,
    STATIC_BLOCK_INPUT_CARD,
])

definePageMeta({
    layout: 'clean',
})
</script>

<template>
    <EditorMain
        :editor-mode="EDITOR_MODE_CHECK_IN_PAGE"
        :custom-blocks="customBlocks"
        :static-blocks="staticBlocks"
        :html-preview-fn="checkInPageHtml"
        :default-orientation="EDITOR_CANVAS_PORTRAIT"
        :canvas-size-options="CANVAS_SIZE_PRESETS_CHECK_IN_PAGE"
        rotateable
        with-preview
        :preview-path="`/events/${eventId}/check-in-preview`"
        :preview-key="LOCALSTORAGE_CHECK_IN_PREVIEW"
        page-title="Check In Page Key Visual Editor"
    />
</template>
