<script setup lang="ts">
const customBlocks = ref([
    BLOCK_TEXT_DEFAULT,
])

definePageMeta({
    layout: 'clean',
})
</script>

<template>
    <EditorMain
        :editor-mode="EDITOR_MODE_INVITATION_EMAIL"
        :custom-blocks="customBlocks"
        :static-blocks="[]"
        :html-preview-fn="invitationEmailHtml"
        :default-orientation="EDITOR_CANVAS_PORTRAIT"
        :canvas-size-options="CANVAS_SIZE_PRESETS_INVITATION_EMAIL"
        :default-breakpoint="BREAKPOINT_MD"
        page-title="Invitation Email Key Visual Editor"
    />
</template>
