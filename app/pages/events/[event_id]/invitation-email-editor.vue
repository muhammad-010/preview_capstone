<script setup lang="ts">
const customBlocks = ref([
    BLOCK_TEXT_DEFAULT,
])

definePageMeta({
    layout: 'clean',
})
</script>

<template>
    <EditorDragNDrop
        :editor-mode="EDITOR_MODE_INVITATION_EMAIL"
        :custom-blocks="customBlocks"
        :static-blocks="[]"
        :html-preview-fn="invitationEmailHtml"
        :default-orientation="EDITOR_CANVAS_PORTRAIT"
        page-title="Invitation Email Key Visual Editor"
    />
</template>
