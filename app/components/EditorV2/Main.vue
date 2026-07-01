<script setup lang="ts">
/**
 * EditorV2 root — a Canva-like key-visual editor. It accepts the EXACT same
 * props and emits the same `refresh` event as the current editor
 * (app/components/Editor/Main.vue), reusing the same backend API + template
 * format via useEditorV2(). Only the UI/UX differs (DOM canvas, direct
 * manipulation, snapping, undo/redo, layers, multi-select, contextual toolbar).
 */
const props = defineProps<EditorV2Props>()
const emit = defineEmits([EMIT_EDITOR_REFRESH])

const ctx = useEditorV2(props, emit)
provide(EDITOR_V2_KEY, ctx)
useEditorShortcuts(ctx)

// Unlike v1 (which renders inside an iframe and injects font faces there), v2
// renders blocks directly in the page DOM, so the custom fonts' @font-face rules
// must be registered in the document — otherwise a selected font-family silently
// falls back to a default. Browsers only fetch a face when it's actually applied.
const fontFaceRules = computed(() =>
    generateFontFaceRules(props.fontOptions, props.fontOptions.map(f => f.value)),
)
useHead({ style: [{ innerHTML: fontFaceRules, key: 'editor-v2-fonts' }] })
</script>

<template>
    <div class="flex flex-col h-screen p-3 gap-3">
        <!-- TOP BAR -->
        <div class="flex items-center gap-3">
            <UButton
                class="cursor-pointer"
                icon="lucide:chevron-left"
                color="neutral"
                variant="ghost"
                :disabled="ctx.loading.value"
                @click="ctx.goBack()"
            />
            <h2 class="text-base font-semibold mr-2">
                {{ ctx.pageTitle || 'Editor' }}
            </h2>

            <UFieldGroup>
                <UButton
                    color="neutral"
                    variant="outline"
                    icon="lucide:undo-2"
                    :disabled="!ctx.canUndo.value"
                    title="Undo (Cmd/Ctrl+Z)"
                    @click="ctx.undo()"
                />
                <UButton
                    color="neutral"
                    variant="outline"
                    icon="lucide:redo-2"
                    :disabled="!ctx.canRedo.value"
                    title="Redo (Cmd/Ctrl+Shift+Z)"
                    @click="ctx.redo()"
                />
            </UFieldGroup>

            <UFieldGroup>
                <UButton
                    color="neutral"
                    variant="outline"
                    icon="lucide:minus"
                    @click="ctx.zoomBy(-10)"
                />
                <UButton
                    color="neutral"
                    variant="outline"
                    :label="`${ctx.canvasScalePercentage.value}%`"
                    class="tabular-nums w-16 justify-center"
                />
                <UButton
                    color="neutral"
                    variant="outline"
                    icon="lucide:plus"
                    @click="ctx.zoomBy(10)"
                />
            </UFieldGroup>

            <div class="grow" />

            <UButton
                v-if="ctx.withPreview && ctx.previewPath"
                class="cursor-pointer"
                label="Preview"
                color="neutral"
                variant="outline"
                icon="lucide:external-link"
                @click="ctx.preview()"
            />
            <UButton
                class="cursor-pointer"
                label="Save"
                icon="lucide:save"
                :loading="ctx.loading.value"
                :disabled="ctx.loading.value"
                @click="() => ctx.save()"
            />
        </div>

        <!-- CONTEXTUAL TOOLBAR -->
        <div class="rounded-lg border border-default bg-elevated/40 px-3 py-1.5">
            <EditorV2Toolbar />
        </div>

        <!-- WORKSPACE -->
        <div class="flex gap-3 grow min-h-0">
            <!-- LEFT -->
            <div class="w-72 shrink-0 min-h-0">
                <EditorV2LeftPanel />
            </div>

            <!-- CANVAS -->
            <div class="grow min-w-0 rounded-lg border border-default bg-muted/30 overflow-auto scrollbar">
                <MiscLoadingOverlay :loading="ctx.loading.value">
                    <div class="flex justify-center items-center min-h-full min-w-full p-8">
                        <EditorV2Canvas />
                    </div>
                </MiscLoadingOverlay>
            </div>

            <!-- RIGHT -->
            <div class="w-80 shrink-0 flex flex-col gap-4 min-h-0 overflow-y-auto scrollbar">
                <EditorV2RightPanel />
                <EditorV2LayersPanel />
            </div>
        </div>
    </div>
</template>
