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
        :custom-blocks="customBlocks"
        :static-blocks="staticBlocks"
        :canvas-size-options="CANVAS_SIZE_PRESETS_CHECK_IN_PAGE"
        :default-breakpoint="BREAKPOINT_MD"
        :default-orientation="EDITOR_CANVAS_PORTRAIT"
        with-preview
        :html-preview-fn="checkInPageHtml"
        :preview-path="`/events/${eventId}/check-in-preview`"
        :preview-key="LOCALSTORAGE_CHECK_IN_PREVIEW"
        page-title="Check In Page Key Visual Editor"
    />
</template>
