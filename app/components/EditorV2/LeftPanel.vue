<script setup lang="ts">
/**
 * Left rail: element library (drag or click to add), static-block toggles,
 * background image upload, and canvas settings (zoom, orientation, page sizes).
 */
const ctx = useEditorV2Context()

const selectCanvasSizePopover = ref(false)
const canvasPresetPopover = ref(false)
const removeCanvasSizeModal = ref(false)
const removeCanvasSizeTarget = ref<Breakpoint | null>(null)
const removeCanvasSizeLabel = computed(() => ctx.canvasSizeOptions.find(c => c.id === removeCanvasSizeTarget.value)?.label ?? '')

function startDragCustomBlock(e: DragEvent, blockId: string) {
    if (!e.dataTransfer) return
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', blockId)
}

function confirmRemoveCanvasSize(id: Breakpoint) {
    if (ctx.selectedCanvasSizeIds.value.length === 1) return
    removeCanvasSizeTarget.value = id
    removeCanvasSizeModal.value = true
}
function doRemoveCanvasSize() {
    if (removeCanvasSizeTarget.value) ctx.removeCanvasSize(removeCanvasSizeTarget.value)
    removeCanvasSizeModal.value = false
}

// background upload
const bgFile = ref<File>()
watch(bgFile, (f) => {
    if (f) ctx.uploadBackground(f)
})
function clearBg(removeFile: (index?: number) => void) {
    removeFile()
    bgFile.value = undefined
    ctx.clearBackground()
}

// reset background to the default (loaded) image
const resetBgModal = ref(false)
function doResetBg() {
    ctx.resetBackground()
    resetBgModal.value = false
}

function selectCanvasPreset(key: string) {
    ctx.setCanvasPreset(key)
    canvasPresetPopover.value = false
}
</script>

<template>
    <div class="flex flex-col gap-4 overflow-y-auto scrollbar pr-1">
        <!-- BACKGROUND -->
        <UCard :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }">
            <template #header>
                <h5>Background (Max 1MB)</h5>
            </template>
            <UFileUpload
                v-slot="{ open, removeFile }"
                v-model="bgFile"
                accept="image/*"
            >
                <UFieldGroup>
                    <UInput
                        readonly
                        :model-value="ctx.activeBgImage.value?.name || 'Choose Image'"
                        :ui="{ base: 'cursor-pointer' }"
                        @click="open()"
                    />
                    <UButton
                        v-if="ctx.canResetBackground.value"
                        icon="lucide:rotate-ccw"
                        color="neutral"
                        variant="outline"
                        title="Reset to default background"
                        @click="resetBgModal = true"
                    />
                    <UButton
                        :disabled="!ctx.activeBgImage.value?.dataUrl && !bgFile"
                        icon="lucide:trash"
                        :color="!ctx.activeBgImage.value?.dataUrl && !bgFile ? 'neutral' : 'error'"
                        @click="clearBg(removeFile)"
                    />
                </UFieldGroup>
            </UFileUpload>
        </UCard>

        <ModalConfirmNegativeAction
            v-model:open="resetBgModal"
            title="Reset Background"
            body="Reset the background to the default image? Your current background image will be replaced."
            @confirm="doResetBg"
        />

        <!-- CANVAS SETTINGS -->
        <UCard :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }">
            <template #header>
                <h5>Canvas Settings</h5>
            </template>

            <UFormField
                label="Scale (%)"
                class="mb-3"
            >
                <UInputNumber
                    v-model="ctx.canvasScalePercentage.value"
                    :min="10"
                    :max="200"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                v-if="!ctx.canvasImageBased"
                label="Orientation"
            >
                <USelect
                    v-model="ctx.canvasOrientation.value"
                    :items="ctx.canvasOrientationSelections"
                    class="w-full"
                />
            </UFormField>
        </UCard>

        <!-- CANVAS SIZE (image-based editors: invitation / certificate) -->
        <UCard
            v-if="ctx.canvasImageBased && EDITOR_CANVAS_SIZE_PRESETS_ENABLED"
            :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }"
        >
            <template #header>
                <h5>Canvas Size</h5>
            </template>

            <UPopover v-model:open="canvasPresetPopover">
                <UButton
                    class="w-full"
                    color="neutral"
                    variant="outline"
                    :ui="{ base: 'justify-between' }"
                >
                    <span>{{ ctx.activeCanvasPreset.value.label }}</span>
                    <span class="text-dimmed text-xs tabular-nums">
                        {{ ctx.activeCanvasPreset.value.width }}&times;{{ ctx.activeCanvasPreset.value.height }}
                    </span>
                </UButton>

                <template #content>
                    <div class="w-64 p-2 space-y-3">
                        <div>
                            <p class="text-xs font-medium text-dimmed px-1 mb-1">
                                Portrait
                            </p>
                            <div class="space-y-1">
                                <UButton
                                    v-for="preset in ctx.portraitPresets.value"
                                    :key="preset.key"
                                    class="w-full cursor-pointer"
                                    size="sm"
                                    variant="ghost"
                                    :color="ctx.canvasPresetKey.value === preset.key ? 'primary' : 'neutral'"
                                    :ui="{ base: 'justify-between' }"
                                    @click="selectCanvasPreset(preset.key)"
                                >
                                    <span>{{ preset.label }}</span>
                                    <span class="text-dimmed text-xs tabular-nums">{{ preset.width }}&times;{{ preset.height }}</span>
                                </UButton>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs font-medium text-dimmed px-1 mb-1">
                                Landscape
                            </p>
                            <div class="space-y-1">
                                <UButton
                                    v-for="preset in ctx.landscapePresets.value"
                                    :key="preset.key"
                                    class="w-full cursor-pointer"
                                    size="sm"
                                    variant="ghost"
                                    :color="ctx.canvasPresetKey.value === preset.key ? 'primary' : 'neutral'"
                                    :ui="{ base: 'justify-between' }"
                                    @click="selectCanvasPreset(preset.key)"
                                >
                                    <span>{{ preset.label }}</span>
                                    <span class="text-dimmed text-xs tabular-nums">{{ preset.width }}&times;{{ preset.height }}</span>
                                </UButton>
                            </div>
                        </div>
                    </div>
                </template>
            </UPopover>
        </UCard>

        <!-- PAGE SIZES / VARIANTS -->
        <UCard
            v-if="ctx.canvasSizeOptions.length > 1"
            :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }"
        >
            <template #header>
                <h5>Page Sizes</h5>
            </template>
            <div class="space-y-2">
                <UFieldGroup
                    v-for="canvas in ctx.selectedCanvasSizes.value"
                    :key="`selcanvar-${canvas.id}`"
                >
                    <UButton
                        class="cursor-pointer grow"
                        variant="outline"
                        size="lg"
                        :color="ctx.activeCanvasSizeId.value === canvas.id ? 'primary' : 'neutral'"
                        :ui="{ base: 'justify-start!' }"
                        @click="ctx.setActiveCanvasSize(canvas.id)"
                    >
                        <UIcon :name="ctx.activeCanvasSizeId.value === canvas.id ? 'lucide:eye' : 'lucide:eye-off'" />
                        {{ canvas.label }}
                    </UButton>
                    <UButton
                        icon="lucide:trash"
                        color="error"
                        :disabled="ctx.selectedCanvasSizeIds.value.length === 1"
                        @click="confirmRemoveCanvasSize(canvas.id)"
                    />
                </UFieldGroup>

                <UPopover v-model:open="selectCanvasSizePopover">
                    <UButton
                        icon="lucide:plus"
                        color="neutral"
                        variant="outline"
                        class="w-full"
                        :disabled="!ctx.unselectedCanvasSizes.value.length"
                    />
                    <template #content>
                        <div class="flex flex-col gap-2 p-2">
                            <UButton
                                v-for="canvas in ctx.unselectedCanvasSizes.value"
                                :key="`unselcanvar-${canvas.id}`"
                                class="cursor-pointer w-52"
                                variant="outline"
                                size="lg"
                                color="neutral"
                                :ui="{ base: 'justify-start!' }"
                                @click="ctx.addCanvasSize(canvas.id); selectCanvasSizePopover = false"
                            >
                                {{ canvas.label }}
                            </UButton>
                        </div>
                    </template>
                </UPopover>
            </div>
        </UCard>

        <ModalConfirmNegativeAction
            v-model:open="removeCanvasSizeModal"
            title="Remove Variant"
            :body="`Are you sure want to delete variant ${removeCanvasSizeLabel}? All your changes will be deleted and can not restored.`"
            @confirm="doRemoveCanvasSize"
        />

        <!-- ELEMENTS -->
        <UCard :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }">
            <template #header>
                <h5>Elements</h5>
            </template>
            <div class="grid grid-cols-2 gap-2">
                <button
                    v-for="card in ctx.customBlocks"
                    :key="card.id"
                    type="button"
                    draggable="true"
                    class="cursor-move rounded-md border border-default p-3 text-sm hover:bg-elevated transition flex flex-col items-center gap-1"
                    @dragstart="startDragCustomBlock($event, card.id)"
                    @click="ctx.addBlockCenter(card.id)"
                >
                    <UIcon
                        :name="card.type === BLOCK_IMAGE_TYPE || card.type === BLOCK_DYNAMIC_QR_IMAGE_TYPE ? 'lucide:image' : 'lucide:type'"
                        class="size-5"
                    />
                    {{ card.label }}
                </button>
            </div>
        </UCard>

        <!-- STATIC BLOCKS -->
        <UCard
            v-if="ctx.staticBlocks.length"
            :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }"
        >
            <template #header>
                <h5>Static Blocks</h5>
            </template>
            <div class="space-y-2">
                <div
                    v-for="block in ctx.staticBlocks"
                    :key="block.id"
                    class="flex items-center justify-between rounded-md border border-default px-3 py-2 text-sm"
                >
                    <span>{{ block.label }}</span>
                    <UCheckbox
                        :model-value="ctx.activeStaticBlocks.value.includes(block.id)"
                        @update:model-value="ctx.toggleStaticBlock(block.id)"
                    />
                </div>
            </div>
        </UCard>
    </div>
</template>
