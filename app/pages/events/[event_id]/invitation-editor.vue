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
        :custom-blocks="customBlocks"
        :static-blocks="[]"
        :canvas-size-options="CANVAS_SIZE_PRESETS_INVITATION_EMAIL"
        :default-breakpoint="BREAKPOINT_MD"
        :default-orientation="EDITOR_CANVAS_PORTRAIT"
        canvas-image-based
        :default-scale="0.4"
        page-title="Invitation Email Key Visual Editor"
    />
</template>
