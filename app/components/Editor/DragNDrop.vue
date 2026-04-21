<script setup lang="ts">
const props = defineProps<{
    editorMode: EditorMode
    customBlocks: ElementBlock[]
    staticBlocks: ElementBlock[]
    htmlPreviewFn: (bgImage: BackgroundImage, width: number, height: number, content: string, staticContent: string) => string
    canvasSizeOptions: CanvasSize[]
    defaultOrientation: Orientation
    rotateable?: boolean
    withPreview?: boolean
    previewPath?: string
    previewKey?: string
    pageTitle?: string
    defaultScale?: number
}>()

const DRAG_X_LIMIT = 10
const DRAG_Y_LIMIT = 10
const DRAG_DATATRANSFER_COPY = 'copy'
const EVENT_MOUSEMOVE = 'mousemove'
const EVENT_MOUSEUP = 'mouseup'

const router = useRouter()

// CANVAS SETTINGS
const selectedCanvasSizeId = ref(props.canvasSizeOptions[0]!.id)
const selectedCanvasSize = computed(() => props.canvasSizeOptions.find(size => size.id === selectedCanvasSizeId.value) || props.canvasSizeOptions[0]!)
const canvasOrientation = ref<Orientation>(props.defaultOrientation)
const shouldFlipCanvas = computed(() => canvasOrientation.value !== selectedCanvasSize.value!.orientation)
const canvasWidth = computed(() => {
    const size = selectedCanvasSize.value!
    return shouldFlipCanvas.value ? size.height : size.width
})
const canvasHeight = computed(() => {
    const size = selectedCanvasSize.value!
    return shouldFlipCanvas.value ? size.width : size.height
})
const canvasScalePercentage = ref(Math.round((props.defaultScale || EDITOR_CANVAS_SCALE) * 100))
const canvasScale = computed(() => canvasScalePercentage.value / 100)
const canvasOrientationSelections = props.rotateable
    ? [
            EDITOR_CANVAS_PORTRAIT,
            EDITOR_CANVAS_LANDSCAPE,
        ]
    : [props.defaultOrientation]
watch(selectedCanvasSizeId, () => {
    canvasOrientation.value = selectedCanvasSize.value!.orientation
})

// VARIANTS
const selectVariantPopover = ref<boolean>(false)
const selectedVariantIds = ref<string[]>([])
const removeVariantModal = ref<boolean>(false)
const removeVariantTarget = ref<string | null>(null)
const activeVariantId = ref<string | null>(null)
const selectedCanvasVariants = computed(() => props.canvasSizeOptions.filter(c => selectedVariantIds.value.includes(c.id)))
const unselectedCanvasVariants = computed(() => props.canvasSizeOptions.filter(c => !selectedVariantIds.value.includes(c.id)))
const removeVariantTargetCanvas = computed(() => props.canvasSizeOptions.find(c => c.id === removeVariantTarget.value)?.label ?? '')

function addVariant(id: string) {
    if (selectedVariantIds.value.includes(id)) return
    selectedVariantIds.value.push(id)
    activeVariantId.value = id
    selectVariantPopover.value = false
}

function confirmRemoveVariant(id: string) {
    removeVariantTarget.value = id
    removeVariantModal.value = true
}

function removeVariant() {
    if (!removeVariantTarget.value) return

    const id = removeVariantTarget.value
    const index = selectedVariantIds.value.indexOf(id)
    if (index === -1) return

    const wasActive = activeVariantId.value === id

    const next = selectedVariantIds.value[index + 1]
    const prev = selectedVariantIds.value[index - 1]

    selectedVariantIds.value.splice(index, 1)

    if (!wasActive) return

    const candidate = next ?? prev ?? null

    if (candidate) {
        toggleActiveVariant(candidate)
    }
    else {
        activeVariantId.value = null
    }
    removeVariantModal.value = false
}

function toggleActiveVariant(id: string) {
    if (!selectedVariantIds.value.includes(id)) return
    activeVariantId.value = activeVariantId.value === id ? null : id
}

// BACKGROUND IMAGE
const bgImage = ref<BackgroundImage>({
    file: null,
    dataUrl: '',
})

function bgImageToDataURL() {
    const file = bgImage.value.file
    if (!file) {
        bgImage.value.dataUrl = ''
        return
    }

    const reader = new FileReader()
    reader.onload = () => {
        bgImage.value.dataUrl = reader.result as string
    }
    reader.readAsDataURL(file)
}

watch(() => bgImage.value.file, () => bgImageToDataURL())

function onBgImageUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    bgImage.value.file = file
}

function clearBgImage() {
    bgImage.value.file = null
}

// BLOCKS
const blockContainer = ref<ElementBlock[]>([])
const activeStaticBlocks = ref<string[]>([])

function syncStaticBlock(item: ElementBlock) {
    if (!STATIC_BLOCK_IDS.includes(item.id)) return

    const staticBlock = props.staticBlocks.find(b => b.id === item.id)
    if (!staticBlock) return

    staticBlock.style = structuredClone(toRaw(item.style))
    staticBlock.setting = structuredClone(toRaw(item.setting))
    staticBlock.compiledStyle = item.compiledStyle
    staticBlock.x = item.x
    staticBlock.y = item.y
}

// DRAG BLOCKS
const dragging = ref<string | null>(null)
const draggingBlock = ref<string | null>(null)
const offset = ref<Coordinate>({ x: 0, y: 0 })
const tempPosition = ref<Coordinate>({ x: 0, y: 0 })

function startDrag(e: MouseEvent, item: ElementBlock) {
    dragging.value = item.uid
    selectedUid.value = item.uid

    offset.value = {
        x: e.clientX - percentToPx(item.x, canvasWidth.value) * canvasScale.value,
        y: e.clientY - percentToPx(item.y, canvasHeight.value) * canvasScale.value,
    }

    tempPosition.value = { x: item.x, y: item.y }
}

function onMouseMove(e: MouseEvent) {
    if (!dragging.value) return

    const newXPx = (e.clientX - offset.value.x) / canvasScale.value
    const newYPx = (e.clientY - offset.value.y) / canvasScale.value

    const maxXPercent = Math.max(0, ((canvasWidth.value - DRAG_X_LIMIT) / canvasWidth.value) * 100)
    const maxYPercent = Math.max(0, ((canvasHeight.value - DRAG_Y_LIMIT) / canvasHeight.value) * 100)

    const newX = Math.max(0, Math.min(pxToPercent(newXPx, canvasWidth.value), maxXPercent))
    const newY = Math.max(0, Math.min(pxToPercent(newYPx, canvasHeight.value), maxYPercent))

    tempPosition.value = { x: newX, y: newY }
}

function onBlockDragStart(e: DragEvent, blockId: string) {
    draggingBlock.value = blockId
    if (!e.dataTransfer) return
    e.dataTransfer.effectAllowed = DRAG_DATATRANSFER_COPY
}

function onCanvasDragOver(e: DragEvent) {
    if (!draggingBlock.value) return
    e.preventDefault()
    if (!e.dataTransfer) return
    e.dataTransfer.dropEffect = DRAG_DATATRANSFER_COPY
}

function onCanvasDrop(e: DragEvent) {
    if (!draggingBlock.value) return
    e.preventDefault()

    const block = props.customBlocks.find(b => b.id === draggingBlock.value)
    if (!block) return

    const canvasRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const xPx = Math.max(0, Math.min((e.clientX - canvasRect.left) / canvasScale.value, canvasWidth.value - DRAG_X_LIMIT))
    const yPx = Math.max(0, Math.min((e.clientY - canvasRect.top) / canvasScale.value, canvasHeight.value - DRAG_Y_LIMIT))
    const x = Math.round(pxToPercent(xPx, canvasWidth.value))
    const y = Math.round(pxToPercent(yPx, canvasHeight.value))
    const uid = crypto.randomUUID()

    blockContainer.value.push({
        uid,
        id: block.id,
        label: block.label,
        setting: structuredClone(toRaw(block.setting)),
        style: structuredClone(toRaw(block.style)),
        x,
        y,
        compiledStyle: block.compiledStyle,
        html: block.html,
        editableData: block.editableData,
    })

    selectedUid.value = uid
    draggingBlock.value = null
}

function stopDrag() {
    if (!dragging.value) return

    const item = blockContainer.value.find(i => i.uid === dragging.value)
    if (!item) return

    item.x = Math.round(tempPosition.value.x)
    item.y = Math.round(tempPosition.value.y)

    if (STATIC_BLOCK_IDS.includes(item.id)) {
        syncStaticBlock(item)
    }

    dragging.value = null
}

onMounted(() => {
    window.addEventListener(EVENT_MOUSEMOVE, onMouseMove)
    window.addEventListener(EVENT_MOUSEUP, stopDrag)
})

onBeforeUnmount(() => {
    window.removeEventListener(EVENT_MOUSEMOVE, onMouseMove)
    window.removeEventListener(EVENT_MOUSEUP, stopDrag)
})

// BLOCK MANIPULATIONS
const selectedUid = ref<string | null>(null)
const selectedItem = computed(() =>
    blockContainer.value.find(i => i.uid === selectedUid.value),
)
const itemPosition = computed(() => (item: ElementBlock) => {
    if (dragging.value === item.uid) {
        return tempPosition.value
    }
    return { x: item.x, y: item.y }
})

function toggleStaticBlock(id: string) {
    const index = activeStaticBlocks.value.indexOf(id)
    if (index > -1) {
        // Remove
        activeStaticBlocks.value.splice(index, 1)
        blockContainer.value = blockContainer.value.filter(i => i.id !== id)
        if (selectedUid.value === id) selectedUid.value = null
    }
    else {
        // Add
        activeStaticBlocks.value.push(id)
        const block = props.staticBlocks.find(b => b.id === id)
        if (!block) return

        const style = structuredClone(toRaw(block.style))
        const data = structuredClone(toRaw(block.setting))
        blockContainer.value.push({
            uid: id, // Use id as uid for static
            id: block.id,
            label: block.label,
            setting: data,
            style,
            x: block.x,
            y: block.y,
            compiledStyle: block.compiledStyle,
            html: block.html,
            editableData: block.editableData,
        })
        selectedUid.value = id
    }
}

function removeBlock(uid: string) {
    blockContainer.value = blockContainer.value.filter(i => i.uid !== uid)
}

function duplicateBlock(item: ElementBlock) {
    const style = structuredClone(toRaw(item.style))
    const config = structuredClone(toRaw(item.setting))
    const newItem = {
        ...item,
        uid: crypto.randomUUID(),
        setting: config,
        style,
        x: item.x + 5,
        y: item.y + 5,
    } as ElementBlock
    newItem.compiledStyle = compileBlockStyle(newItem)
    blockContainer.value.push(newItem)
}

function onBlockDragEnd() {
    draggingBlock.value = null
}

function setStyleValue(style: BlockStyle[], key: string, value: string | boolean | number) {
    const item = style.find(s => s.key === key)
    if (item) {
        item.value = value
    }

    if (selectedItem.value) {
        selectedItem.value.compiledStyle = compileBlockStyle(selectedItem.value)
    }

    if (selectedItem.value && STATIC_BLOCK_IDS.includes(selectedItem.value.id)) {
        syncStaticBlock(selectedItem.value)
    }
}

function updateBlockData(key: string, value: string) {
    if (!selectedItem.value) return

    const dataItem = selectedItem.value.setting.find(d => d.key === key)
    if (dataItem) {
        dataItem.value = value
    }

    if (STATIC_BLOCK_IDS.includes(selectedItem.value.id)) {
        syncStaticBlock(selectedItem.value)
    }
}

function updatePosition(value: number, coord: CoordinateKey) {
    if (!selectedItem.value) return

    selectedItem.value[coord] = value
    if (STATIC_BLOCK_IDS.includes(selectedItem.value.id)) {
        syncStaticBlock(selectedItem.value)
    }
}

// HTML GENERATION
const generatedHtml = ref('')
const loadingPreview = ref(false)
let previewTimeout: ReturnType<typeof setTimeout>

function renderBlock(block: ElementBlock) {
    if (!block) return ''
    const absoluteStyle = getAbsoluteDivStyle(block)
    return `
    <div style="${absoluteStyle}">
        ${block.html(block.setting, block.compiledStyle)}
    </div>
    `
}

function getPreviewHTML(bgImage: BackgroundImage, width: number, height: number, content: string, staticContent: string) {
    if (!props.htmlPreviewFn) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container {
                    background-image: url(${bgImage.dataUrl});
                    background-size: contain;
                    background-position: center;
                    background-no-repeat: no-repeat;
                }
            </style>
        </head>
        <body style="margin:0;padding:0;">
            <div class="container" style="position:relative;width:${canvasWidth.value}px;height:${canvasHeight.value}px;">
                ${content}
                ${staticContent}
            </div>
        </body>
        </html>
        `
    }

    return props.htmlPreviewFn(bgImage, width, height, content, staticContent)
}

function refreshGeneratedHtml() {
    const content = blockContainer.value.map((block) => {
        if (!block) return ''
        return renderBlock(block)
    }).join('\n')
    const staticContent = activeStaticBlocks.value.map((id) => {
        const block = props.staticBlocks.find(b => b.id === id)
        if (!block) return ''
        return renderBlock(block)
    }).join('\n')

    generatedHtml.value = getPreviewHTML(bgImage.value, canvasWidth.value, canvasHeight.value, content, staticContent)
    loadingPreview.value = false
}

watch([
    blockContainer,
    activeStaticBlocks,
    bgImage,
    canvasWidth,
    canvasHeight,
],
() => {
    loadingPreview.value = true
    clearTimeout(previewTimeout)

    previewTimeout = setTimeout(() => {
        refreshGeneratedHtml()
    }, 500)
}, { deep: true })

// PREVIEW
function saveToLocalStorage() {
    if (!props.previewKey) return

    const customBlock: Block[] = []
    const staticBlock: Block[] = []

    const customBlockList = blockContainer.value.filter(b => !STATIC_BLOCK_IDS.includes(b.id))
    for (let i = 0; i < customBlockList.length; i++) {
        const block = customBlockList[i]
        if (!block) continue

        customBlock.push({
            id: block.id,
            style: block.style.map(b => ({ key: b.key, value: b.value })),
            setting: block.setting.map(b => ({ key: b.key, value: b.value })),
            x: block.x,
            y: block.y,
            compiledStyle: compileBlockStyle(block),
        })
    }

    const staticBlockList = props.staticBlocks
    for (let i = 0; i < staticBlockList.length; i++) {
        const block = staticBlockList[i]
        if (!block) continue

        staticBlock.push({
            id: block.id,
            style: block.style.map(b => ({ key: b.key, value: b.value })),
            setting: block.setting.map(b => ({ key: b.key, value: b.value })),
            x: block.x,
            y: block.y,
            compiledStyle: compileBlockStyle(block),
        })
    }

    const settings = {
        bgImage: bgImage.value.dataUrl,
        slug: BREAKPOINT_MD,
        customBlock,
        staticBlock,
    } as SavedVariant

    localStorage.setItem(props.previewKey, JSON.stringify(settings))
}

function preview() {
    if (!import.meta.client || !props.previewPath) return

    saveToLocalStorage()
    window.open(props.previewPath, '_blank', 'noopener,noreferrer')
}
</script>

<template>
    <div class="flex flex-col p-8">
        <div class="flex justify-between mb-4">
            <div class="flex items-center gap-4">
                <UButton
                    class="cursor-pointer"
                    label="Back"
                    icon="lucide:chevron-left"
                    color="neutral"
                    variant="ghost"
                    :disabled="loadingPreview"
                    @click="router.go(-1)"
                />

                <h2>{{ pageTitle || 'Editor' }}</h2>
            </div>

            <div class="flex gap-4">
                <UButton
                    class="cursor-pointer"
                    label="Refresh Preview"
                    color="neutral"
                    variant="outline"
                    :disabled="loadingPreview"
                    @click="refreshGeneratedHtml"
                />

                <UButton
                    v-if="withPreview && previewPath"
                    class="cursor-pointer"
                    label="Preview Page"
                    color="neutral"
                    variant="outline"
                    @click="preview"
                />

                <UButton
                    class="cursor-pointer"
                    label="Save Settings"
                    @click="saveToLocalStorage"
                />
            </div>
        </div>

        <div class="grid grid-cols-7 h-[90vh] gap-4">
            <!-- LEFT: ElementBlock list + resizable HTML preview -->
            <div class="flex flex-col gap-4">
                <!-- CANVAS SETTINGS -->
                <UCard :ui="{ body: 'p-2 sm:p-3' }">
                    <template #header>
                        <h3>Canvas Settings</h3>
                    </template>

                    <div class="mb-4">
                        <UFormField label="Scale (%)">
                            <UInput
                                v-model.number="canvasScalePercentage"
                                type="number"
                                min="10"
                                max="100"
                                class="w-full"
                            />
                        </UFormField>
                    </div>

                    <div class="mb-4">
                        <UFormField label="Orientation">
                            <USelect
                                v-model="canvasOrientation"
                                :items="canvasOrientationSelections"
                                :disabled="!rotateable"
                                class="w-full"
                            />
                        </UFormField>
                    </div>

                    <div class="mb-4">
                        <UFormField label="Size">
                            <USelect
                                v-model="selectedCanvasSizeId"
                                :items="canvasSizeOptions"
                                value-key="id"
                                class="w-full"
                            />
                        </UFormField>
                    </div>
                </UCard>

                <!-- VARIANTS -->
                <UCard :ui="{ body: 'p-2 sm:p-3' }">
                    <template #header>
                        <h3>Variants</h3>
                    </template>
                    <div class="space-y-2">
                        <div
                            v-for="canvas in selectedCanvasVariants"
                            :key="`selcanvar-${canvas.id}`"
                            class="flex items-center gap-2 py-2 px-4 border rounded-lg w-52"
                            :class="activeVariantId === canvas.id ? 'border-green-500' : 'border-neutral-950/25 dark:border-neutral-50/25'"
                        >
                            <UIcon
                                :name="activeVariantId === canvas.id ? 'lucide:eye' : 'lucide:eye-off'"
                                :class="`cursor-pointer ${activeVariantId === canvas.id ? 'text-success' : 'text-dimmed'}`"
                                @click="toggleActiveVariant(canvas.id)"
                            />
                            {{ canvas.label }}
                            <UIcon
                                name="lucide:trash"
                                class="cursor-pointer text-error ml-auto"
                                @click="confirmRemoveVariant(canvas.id)"
                            />
                        </div>
                        <UPopover v-model:open="selectVariantPopover">
                            <UButton
                                icon="lucide:plus"
                                color="neutral"
                                variant="outline"
                                class="w-52"
                                :disabled="!unselectedCanvasVariants.length"
                            />

                            <template #content>
                                <div class="p-2">
                                    <UFieldGroup orientation="vertical">
                                        <div
                                            v-for="canvas in unselectedCanvasVariants"
                                            :key="`unselcanvar-${canvas.id}`"
                                            class="cursor-pointer flex items-center gap-2 py-2 px-4 border border-neutral-950/25 dark:border-neutral-50/25 hover:border-primary first:rounded-t last:rounded-b w-52"
                                            @click="addVariant(canvas.id)"
                                        >
                                            {{ canvas.label }}
                                        </div>
                                    </UFieldGroup>
                                </div>
                            </template>
                        </UPopover>
                    </div>
                </UCard>

                <ModalConfirmNegativeAction
                    v-model:open="removeVariantModal"
                    title="Remove Variant"
                    :body="`Are you sure want to delete variant ${removeVariantTargetCanvas}? All your changes will be deleted and can not restored.`"
                    @confirm="() => removeVariant()"
                />

                <!-- BLOCKS -->
                <UCard :ui="{ body: 'p-2 sm:p-3' }">
                    <template #header>
                        <h3>Blocks</h3>
                    </template>
                    <div class="space-y-2">
                        <div
                            v-for="card in customBlocks"
                            :key="card.id"
                            class="py-2 px-4 border border-neutral-950/25 dark:border-neutral-50/25 hover:bg-neutral-100 dark:hover:bg-neutral-950 rounded cursor-move w-52"
                            draggable="true"
                            @dragstart="onBlockDragStart($event, card.id)"
                            @dragend="onBlockDragEnd"
                        >
                            {{ card.label }}
                        </div>
                    </div>
                </UCard>

                <!-- STATIC BLOCKS -->
                <UCard
                    v-if="staticBlocks.length"
                    :ui="{ body: 'p-2 sm:p-3' }"
                >
                    <template #header>
                        <h3>Static Blocks</h3>
                    </template>
                    <div class="space-y-2">
                        <div
                            v-for="block in staticBlocks"
                            :key="block.id"
                            class="flex items-center justify-between py-2 px-4 border border-neutral-950/25 dark:border-neutral-50/25 rounded w-52"
                        >
                            <span>{{ block.label }}</span>
                            <UCheckbox
                                :model-value="activeStaticBlocks.includes(block.id)"
                                @update:model-value="toggleStaticBlock(block.id)"
                            />
                        </div>
                    </div>
                </UCard>

                <!-- RAW HTML (resizable) -->
                <DevOnly>
                    <UCard :ui="{ body: 'p-2 sm:p-3' }">
                        <template #header>
                            <h3>HTML Preview</h3>
                        </template>

                        <UTextarea
                            v-model="generatedHtml"
                            size="sm"
                            class="rounded w-full font-mono py-1 px-2 resize-y"
                            readonly
                            :ui="{ base: 'scrollbar' }"
                        />
                    </UCard>
                </DevOnly>
            </div>

            <!-- CENTER: Canvas and iframe -->
            <div class="col-span-5 overflow-y-auto p-4 scrollbar">
                <div :class="canvasOrientation === 'portrait' ? 'flex gap-4 justify-evenly items-center min-h-full' : 'flex flex-col gap-4 justify-evenly items-center min-h-full'">
                    <!-- CANVAS -->
                    <div
                        :class="`border border-neutral-950/25 dark:border-neutral-50/25 bg-neutral-100 dark:bg-neutral-900 rounded relative overflow-hidden`"
                        :style="{
                            width: canvasWidth * canvasScale + 'px',
                            height: canvasHeight * canvasScale + 'px',
                        }"
                        @dragover="onCanvasDragOver"
                        @drop="onCanvasDrop"
                    >
                        <div
                            :style="{
                                width: canvasWidth + 'px',
                                height: canvasHeight + 'px',
                                transform: `scale(${canvasScale})`,
                                transformOrigin: 'top left',
                            }"
                        >
                            <div
                                v-for="item in blockContainer"
                                :key="item.uid"
                                class="absolute cursor-move"
                                :style="{ left: itemPosition(item).x + '%', top: itemPosition(item).y + '%' }"
                                @mousedown.prevent="startDrag($event, item)"
                                @click.stop="selectedUid = item.uid"
                            >
                                <UChip position="top-left">
                                    <div
                                        :class="[
                                            'py-2 px-4 border border-neutral-950/25 dark:border-neutral-50/25 hover:bg-neutral-100 dark:hover:bg-neutral-950 rounded w-52',
                                            selectedUid === item.uid ? 'border-neutral-500 dark:border-neutral-400' : '',
                                        ]"
                                    >
                                        <div class="flex justify-between">
                                            {{ customBlocks.find(c => c.id === item.id)?.label || staticBlocks.find(c => c.id === item.id)?.label }}

                                            <div
                                                v-if="!STATIC_BLOCK_IDS.includes(item.id)"
                                                class="flex gap-2"
                                            >
                                                <UButton
                                                    size="xs"
                                                    label="Dup"
                                                    @click.stop="duplicateBlock(item)"
                                                />
                                                <UButton
                                                    size="xs"
                                                    color="error"
                                                    label="Del"
                                                    @click.stop="removeBlock(item.uid)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </UChip>
                            </div>
                        </div>
                    </div>

                    <!-- PREVIEW -->
                    <MiscLoadingOverlay :loading="loadingPreview">
                        <div
                            :class="`border border-neutral-950/25 dark:border-neutral-50/25 rounded overflow-hidden`"
                            :style="{
                                width: canvasWidth * canvasScale + 'px',
                                height: canvasHeight * canvasScale + 'px',
                            }"
                        >
                            <iframe
                                :style="{
                                    width: canvasWidth + 'px',
                                    height: canvasHeight + 'px',
                                    transform: `scale(${canvasScale})`,
                                    transformOrigin: 'top left',
                                    border: 'none',
                                }"
                                :srcdoc="generatedHtml"
                            />
                        </div>
                    </MiscLoadingOverlay>
                </div>
            </div>

            <!-- RIGHT: Page settings and settings -->
            <div class="flex flex-col gap-4">
                <!-- PAGE SETTINGS -->
                <UCard :ui="{ body: 'p-2 sm:p-3' }">
                    <template #header>
                        <div class="flex items-center justify-between gap-2">
                            <h3>Page Settings</h3>
                        </div>
                    </template>

                    <div class="mb-4">
                        <h4 class="text-sm font-medium mb-2">
                            Background Image
                        </h4>
                        <UFieldGroup>
                            <UInput
                                type="file"
                                accept="image/*"
                                @change="(e) => onBgImageUpload(e)"
                            />
                            <UButton
                                v-if="bgImage.file"
                                icon="lucide:x"
                                @click="clearBgImage()"
                            />
                        </UFieldGroup>
                    </div>
                </UCard>

                <!-- SETTINGS -->
                <UCard :ui="{ body: 'p-2 sm:p-3' }">
                    <template #header>
                        <h3>ElementBlock Settings</h3>
                    </template>

                    <div v-if="selectedItem">
                        <div
                            v-if="selectedItem.editableData"
                            class="mb-4"
                        >
                            <div
                                v-for="dataItem in selectedItem.setting"
                                :key="dataItem.key"
                                class="mb-4"
                            >
                                <UFormField :label="dataItem.label">
                                    <UInput
                                        :model-value="dataItem.value"
                                        @update:model-value="(value) => updateBlockData(dataItem.key, value)"
                                    />
                                </UFormField>
                            </div>
                        </div>

                        <div class="mb-4">
                            <h4 class="text-sm font-medium mb-2">
                                Position
                            </h4>
                            <div class="grid grid-cols-2 gap-2">
                                <UFormField label="X (%)">
                                    <UInput
                                        :model-value="selectedItem.x"
                                        type="number"
                                        :step="0.2"
                                        @update:model-value="(value) => updatePosition(Number(value), 'x')"
                                    />
                                </UFormField>
                                <UFormField label="Y (%)">
                                    <UInput
                                        :model-value="selectedItem.y"
                                        type="number"
                                        :step="0.2"
                                        @update:model-value="(value) => updatePosition(Number(value), 'y')"
                                    />
                                </UFormField>
                            </div>
                        </div>

                        <div
                            v-for="(field, index) in selectedItem.style"
                            :key="field.key"
                            class="mb-4"
                        >
                            <template v-if="selectedItem.style[index]">
                                <UCheckbox
                                    v-if="field.type === 'checkbox'"
                                    :model-value="Boolean(getBlockStyleValue(selectedItem.style, field.key))"
                                    :label="field.label"
                                    @update:model-value="(e) => selectedItem && setStyleValue(selectedItem.style, field.key, e)"
                                />

                                <UFormField
                                    v-else
                                    class="mb-2"
                                    :label="field.label"
                                >
                                    <USelect
                                        v-if="field.type === 'select' && field.options"
                                        :model-value="String(getBlockStyleValue(selectedItem.style, field.key))"
                                        :items="field.options"
                                        class="w-full"
                                        @update:model-value="(e) => selectedItem && setStyleValue(selectedItem.style, field.key, e)"
                                    />

                                    <UPopover v-else-if="field.type === 'color'">
                                        <UButton
                                            label="Choose color"
                                            color="neutral"
                                            variant="outline"
                                        >
                                            <template #leading>
                                                <span
                                                    :style="{ backgroundColor: String(getBlockStyleValue(selectedItem.style, field.key)) }"
                                                    class="size-3 rounded-full"
                                                />
                                            </template>
                                        </UButton>

                                        <template #content>
                                            <UColorPicker
                                                :model-value="String(getBlockStyleValue(selectedItem.style, field.key))"
                                                @update:model-value="(e) => selectedItem && setStyleValue(selectedItem.style, field.key, e || '#000000')"
                                            />
                                        </template>
                                    </UPopover>

                                    <UInput
                                        v-else-if="field.type === 'number'"
                                        type="number"
                                        :model-value="Number(getBlockStyleValue(selectedItem.style, field.key))"
                                        class="w-full"
                                        :step="0.1"
                                        @update:model-value="(e) => selectedItem && setStyleValue(selectedItem.style, field.key, e)"
                                    />

                                    <UInput
                                        v-else
                                        :type="field.type"
                                        :model-value="String(getBlockStyleValue(selectedItem.style, field.key))"
                                        class="w-full"
                                        @update:model-value="(e) => selectedItem && setStyleValue(selectedItem.style, field.key, e)"
                                    />
                                </UFormField>
                            </template>
                        </div>
                    </div>

                    <div v-else>
                        <span class="text-dimmed">
                            Select a block
                        </span>
                    </div>
                </UCard>
            </div>
        </div>
    </div>
</template>
