<script setup lang="ts">
const props = defineProps<{
    editorMode: EditorMode
    customBlocks: Block[]
    staticBlocks: Block[]
    htmlPreviewFn: (bgImage: BackgroundImage, width: number, height: number, content: string, staticContent: string) => string
    canvasSizeOptions: CanvasSize[]
    defaultOrientation: Orientation
    defaultCanvasSize?: string
    rotateable?: boolean
    withPreview?: boolean
    previewPath?: string
    previewKey?: string
    pageTitle?: string
    defaultScale?: number
}>()

const DRAGGABLE_BLOCK_WIDTH = 208
const DRAGGABLE_BLOCK_HEIGHT = 44
const DRAG_DATATRANSFER_COPY = 'copy'
const EVENT_MOUSEMOVE = 'mousemove'
const EVENT_MOUSEUP = 'mouseup'

// CANVAS SETTINGS
const selectedCanvasSizeLabel = ref(props.defaultCanvasSize || props.canvasSizeOptions[0]!.label)
const selectedCanvasSize = computed(() => props.canvasSizeOptions.find(size => size.label === selectedCanvasSizeLabel.value) || props.canvasSizeOptions[0]!)
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
watch(selectedCanvasSizeLabel, () => {
    canvasOrientation.value = selectedCanvasSize.value!.orientation
})

// BACKGROUND IMAGE
const bgImage = ref<BackgroundImage>({
    portrait: null,
    landscape: null,
    portraitDataURL: '',
    landscapeDataURL: '',
})

function bgImageToDataURL(orientation: Orientation) {
    const file = bgImage.value[orientation]
    if (!file) {
        bgImage.value[`${orientation}DataURL`] = ''
        return
    }

    const reader = new FileReader()
    reader.onload = () => {
        bgImage.value[`${orientation}DataURL`] = reader.result as string
    }
    reader.readAsDataURL(file)
}

watch(() => bgImage.value.portrait, () => bgImageToDataURL(EDITOR_CANVAS_PORTRAIT))
watch(() => bgImage.value.landscape, () => bgImageToDataURL(EDITOR_CANVAS_LANDSCAPE))

function onBgImageUpload(e: Event, orientation: Orientation) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    bgImage.value[orientation] = file
}

function clearBgImage(orientation: Orientation) {
    bgImage.value[orientation] = null
}

// BLOCKS
const blockContainer = ref<Block[]>([])
const activeStaticBlocks = ref<string[]>([])

function syncStaticBlock(item: Block) {
    if (!STATIC_BLOCK_IDS.includes(item.id)) return

    const staticBlock = props.staticBlocks.find(b => b.id === item.id)
    if (!staticBlock) return

    staticBlock.style = structuredClone(toRaw(item.style))
    staticBlock.data = structuredClone(toRaw(item.data))
    staticBlock.compiledStyle = item.compiledStyle
    staticBlock.portraitPos.x = item.portraitPos.x
    staticBlock.portraitPos.y = item.portraitPos.y
    staticBlock.landscapePos.x = item.landscapePos.x
    staticBlock.landscapePos.y = item.landscapePos.y
}

// DRAG BLOCKS
const dragging = ref<string | null>(null)
const draggingBlock = ref<string | null>(null)
const offset = ref<Coordinate>({ x: 0, y: 0 })
const tempPosition = ref<Coordinate>({ x: 0, y: 0 })

function startDrag(e: MouseEvent, item: Block) {
    dragging.value = item.uid
    selectedUid.value = item.uid

    const pos = canvasOrientation.value === EDITOR_CANVAS_PORTRAIT ? item.portraitPos : item.landscapePos
    offset.value = {
        x: e.clientX - percentToPx(pos.x, canvasWidth.value) * canvasScale.value,
        y: e.clientY - percentToPx(pos.y, canvasHeight.value) * canvasScale.value,
    }

    tempPosition.value = { x: pos.x, y: pos.y }
}

function onMouseMove(e: MouseEvent) {
    if (!dragging.value) return

    const newXPx = (e.clientX - offset.value.x) / canvasScale.value
    const newYPx = (e.clientY - offset.value.y) / canvasScale.value

    const maxXPercent = Math.max(0, ((canvasWidth.value - DRAGGABLE_BLOCK_WIDTH) / canvasWidth.value) * 100)
    const maxYPercent = Math.max(0, ((canvasHeight.value - DRAGGABLE_BLOCK_HEIGHT) / canvasHeight.value) * 100)

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
    const xPx = Math.max(0, Math.min((e.clientX - canvasRect.left) / canvasScale.value, canvasWidth.value - DRAGGABLE_BLOCK_WIDTH))
    const yPx = Math.max(0, Math.min((e.clientY - canvasRect.top) / canvasScale.value, canvasHeight.value - DRAGGABLE_BLOCK_HEIGHT))
    const x = Math.round(pxToPercent(xPx, canvasWidth.value))
    const y = Math.round(pxToPercent(yPx, canvasHeight.value))
    const uid = crypto.randomUUID()

    blockContainer.value.push({
        uid,
        id: block.id,
        label: block.label,
        data: structuredClone(toRaw(block.data)),
        style: structuredClone(toRaw(block.style)),
        portraitPos: {
            x: canvasOrientation.value === EDITOR_CANVAS_PORTRAIT ? x : 0,
            y: canvasOrientation.value === EDITOR_CANVAS_PORTRAIT ? y : 0,
        },
        landscapePos: {
            x: canvasOrientation.value === EDITOR_CANVAS_LANDSCAPE ? x : 0,
            y: canvasOrientation.value === EDITOR_CANVAS_LANDSCAPE ? y : 0,
        },
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

    const pos = canvasOrientation.value === EDITOR_CANVAS_PORTRAIT ? item.portraitPos : item.landscapePos
    pos.x = Math.round(tempPosition.value.x)
    pos.y = Math.round(tempPosition.value.y)

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
const itemPosition = computed(() => (item: Block) => {
    if (dragging.value === item.uid) {
        return tempPosition.value
    }
    const pos = canvasOrientation.value === EDITOR_CANVAS_PORTRAIT ? item.portraitPos : item.landscapePos
    return { x: pos.x, y: pos.y }
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
        const data = structuredClone(toRaw(block.data))
        blockContainer.value.push({
            uid: id, // Use id as uid for static
            id: block.id,
            label: block.label,
            data,
            style,
            portraitPos: structuredClone(toRaw(block.portraitPos)),
            landscapePos: structuredClone(toRaw(block.landscapePos)),
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

function duplicateBlock(item: Block) {
    const style = structuredClone(toRaw(item.style))
    const data = structuredClone(toRaw(item.data))
    const portraitSettings = structuredClone(toRaw(item.portraitPos))
    portraitSettings.x = item.portraitPos.x + 5
    portraitSettings.y = item.portraitPos.y + 5
    const landscapeSettings = structuredClone(toRaw(item.landscapePos))
    landscapeSettings.x = item.landscapePos.x + 5
    landscapeSettings.y = item.landscapePos.y + 5
    const newItem = {
        ...item,
        data,
        uid: crypto.randomUUID(),
        style,
        portraitSettings,
        landscapeSettings,
        compiledStyle: compileBlockStyle(item),
    }
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

    const dataItem = selectedItem.value.data.find(d => d.key === key)
    if (dataItem) {
        dataItem.value = value
    }

    if (STATIC_BLOCK_IDS.includes(selectedItem.value.id)) {
        syncStaticBlock(selectedItem.value)
    }
}

function updatePosition(key: CoordinateKey, value: number, orientation?: Orientation) {
    if (!selectedItem.value) return

    const targetOrientation = orientation || canvasOrientation.value
    const settings = targetOrientation === EDITOR_CANVAS_PORTRAIT ? selectedItem.value.portraitPos : selectedItem.value.landscapePos
    settings[key] = value
    if (STATIC_BLOCK_IDS.includes(selectedItem.value.id)) {
        syncStaticBlock(selectedItem.value)
    }
}

// HTML GENERATION
const generatedHtml = ref('')
const loadingPreview = ref(false)
let previewTimeout: ReturnType<typeof setTimeout>

function renderBlock(block: Block) {
    if (!block) return ''
    const absoluteStyle = getAbsoluteDivStyle(block, canvasOrientation.value === EDITOR_CANVAS_PORTRAIT)
    return `
    <div style="${absoluteStyle}">
        ${block.html(block.data, block.compiledStyle)}
    </div>
    `
}

function getPreviewHTML(bgImage: BackgroundImage, width: number, height: number, content: string, staticContent: string) {
    if (!props.htmlPreviewFn) {
        const image = height >= width ? bgImage.portraitDataURL : bgImage.landscapeDataURL
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container {
                    background-image: url(${image});
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

    const customBlock: SavedBlockSettings[] = []
    const staticBlock: SavedBlockSettings[] = []

    const customBlockList = blockContainer.value.filter(b => !STATIC_BLOCK_IDS.includes(b.id))
    for (let i = 0; i < customBlockList.length; i++) {
        const block = customBlockList[i]
        if (!block) continue

        customBlock.push({
            id: block.id,
            style: block.style.map(b => ({ key: b.key, value: b.value })),
            data: block.data.map(b => ({ key: b.key, value: b.value })),
            portraitPos: structuredClone(toRaw(block.portraitPos)),
            landscapePos: structuredClone(toRaw(block.landscapePos)),
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
            data: block.data.map(b => ({ key: b.key, value: b.value })),
            portraitPos: structuredClone(toRaw(block.portraitPos)),
            landscapePos: structuredClone(toRaw(block.landscapePos)),
            compiledStyle: compileBlockStyle(block),
        })
    }

    const settings = {
        bgPortraitDataURL: bgImage.value.portraitDataURL,
        bgLandscapeDataURL: bgImage.value.landscapeDataURL,
        customBlock,
        staticBlock,
    } as SavedSetttings

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
            <h2>{{ pageTitle || 'Editor' }}</h2>
            <div class="flex gap-4">
                <UButton
                    class="cursor-pointer"
                    label="Refresh Preview"
                    :disabled="loadingPreview"
                    @click="refreshGeneratedHtml"
                />

                <UButton
                    v-if="withPreview && previewPath"
                    class="cursor-pointer"
                    label="Preview Page"
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
            <!-- LEFT: Block list + resizable HTML preview -->
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
                                v-model="selectedCanvasSizeLabel"
                                :items="canvasSizeOptions"
                                value-key="label"
                                class="w-full"
                            />
                        </UFormField>
                    </div>
                </UCard>

                <!-- BLOCKS -->
                <UCard :ui="{ body: 'p-2 sm:p-3' }">
                    <template #header>
                        <h3>Blocks</h3>
                    </template>
                    <div class="space-y-2">
                        <div
                            v-for="card in customBlocks"
                            :key="card.id"
                            class="py-2 px-4 border border-slate-950/25 dark:border-slate-50/25 hover:bg-slate-100 dark:hover:bg-slate-950 rounded cursor-move w-52"
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
                            class="flex items-center justify-between py-2 px-4 border border-slate-950/25 dark:border-slate-50/25 rounded w-52"
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
                        :class="`border border-slate-950/25 dark:border-slate-50/25 bg-slate-100 dark:bg-slate-900 rounded relative overflow-hidden`"
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
                                            'py-2 px-4 border border-slate-950/25 dark:border-slate-50/25 hover:bg-slate-100 dark:hover:bg-slate-950 rounded w-52',
                                            selectedUid === item.uid ? 'border-slate-500 dark:border-slate-400' : '',
                                        ]"
                                    >
                                        <div class="flex justify-between">
                                            {{ customBlocks.find(c => c.id === item.id)?.label || staticBlocks.find(c => c.id === item.id)?.label }}

                                            <div
                                                v-if="!['qr-code', 'input-card'].includes(item.id)"
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
                            :class="`border border-slate-950/25 dark:border-slate-50/25 rounded overflow-hidden`"
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

                    <div
                        v-if="rotateable || canvasOrientationSelections.includes(EDITOR_CANVAS_PORTRAIT)"
                        class="mb-4"
                    >
                        <h4 class="text-sm font-medium mb-2">
                            Portrait Background Image
                        </h4>
                        <UFieldGroup>
                            <UInput
                                type="file"
                                accept="image/*"
                                @change="(e) => onBgImageUpload(e, 'portrait')"
                            />
                            <UButton
                                v-if="bgImage.portrait"
                                icon="lucide:x"
                                @click="clearBgImage('portrait')"
                            />
                        </UFieldGroup>
                    </div>

                    <div
                        v-if="rotateable || canvasOrientationSelections.includes(EDITOR_CANVAS_LANDSCAPE)"
                        class="mb-4"
                    >
                        <h4 class="text-sm font-medium mb-2">
                            Landscape Background Image
                        </h4>
                        <UFieldGroup>
                            <UInput
                                type="file"
                                accept="image/*"
                                @change="(e) => onBgImageUpload(e, 'landscape')"
                            />
                            <UButton
                                v-if="bgImage.landscape"
                                icon="lucide:x"
                                @click="clearBgImage('landscape')"
                            />
                        </UFieldGroup>
                    </div>
                </UCard>

                <!-- SETTINGS -->
                <UCard :ui="{ body: 'p-2 sm:p-3' }">
                    <template #header>
                        <h3>Block Settings</h3>
                    </template>

                    <div v-if="selectedItem">
                        <div
                            v-if="selectedItem.editableData"
                            class="mb-4"
                        >
                            <div
                                v-for="dataItem in selectedItem.data"
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

                        <div
                            v-if="rotateable || canvasOrientationSelections.includes(EDITOR_CANVAS_PORTRAIT)"
                            class="mb-4"
                        >
                            <h4 class="text-sm font-medium mb-2">
                                Portrait Position
                            </h4>
                            <div class="grid grid-cols-2 gap-2">
                                <UFormField label="X (%)">
                                    <UInput
                                        :model-value="selectedItem.portraitPos.x"
                                        type="number"
                                        :step="0.2"
                                        @update:model-value="(value) => updatePosition('x', Number(value), 'portrait')"
                                    />
                                </UFormField>
                                <UFormField label="Y (%)">
                                    <UInput
                                        :model-value="selectedItem.portraitPos.y"
                                        type="number"
                                        :step="0.2"
                                        @update:model-value="(value) => updatePosition('y', Number(value), 'portrait')"
                                    />
                                </UFormField>
                            </div>
                        </div>

                        <div
                            v-if="rotateable || canvasOrientationSelections.includes(EDITOR_CANVAS_LANDSCAPE)"
                            class="mb-4"
                        >
                            <h4 class="text-sm font-medium mb-2">
                                Landscape Position
                            </h4>
                            <div class="grid grid-cols-2 gap-2">
                                <UFormField label="X (%)">
                                    <UInput
                                        :model-value="selectedItem.landscapePos.x"
                                        type="number"
                                        :step="0.2"
                                        @update:model-value="(value) => updatePosition('x', Number(value), 'landscape')"
                                    />
                                </UFormField>
                                <UFormField label="Y (%)">
                                    <UInput
                                        :model-value="selectedItem.landscapePos.y"
                                        type="number"
                                        :step="0.2"
                                        @update:model-value="(value) => updatePosition('y', Number(value), 'landscape')"
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
