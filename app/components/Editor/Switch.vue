<script setup lang="ts">
/**
 * Toggle wrapper that renders either the current editor (EditorMain) or the
 * new Canva-like editor (EditorV2Main), based on the NUXT_PUBLIC_EDITOR_V2_ENABLED
 * env flag. Both editors share the exact same props + `refresh` emit, so every
 * attribute (props and the @refresh listener) is forwarded transparently via
 * $attrs without re-declaring the interface here.
 */
defineOptions({ inheritAttrs: false })

const { public: { editorV2Enabled } } = useRuntimeConfig()
</script>

<template>
    <EditorV2Main
        v-if="editorV2Enabled"
        v-bind="$attrs"
    />
    <EditorMain
        v-else
        v-bind="$attrs"
    />
</template>
