<script setup lang="ts">
const canvasScalePercentage = ref(Math.round(EDITOR_CANVAS_SCALE * 100))
const canvasScale = computed(() => canvasScalePercentage.value / 100)
const canvasOrientation = ref<Orientation>(EDITOR_CANVAS_HEIGHT >= EDITOR_CANVAS_WIDTH ? EDITOR_CANVAS_PORTRAIT : EDITOR_CANVAS_LANDSCAPE)
const canvasOrientationSelections = ref([
    EDITOR_CANVAS_PORTRAIT,
    EDITOR_CANVAS_LANDSCAPE,
])

const CANVAS_SIZE_PRESETS: CanvasSize[] = [
    { width: 600, height: 1750, label: '600x1750 (Email)', orientation: EDITOR_CANVAS_PORTRAIT },
    { width: 360, height: 640, label: '360x640 (Android)', orientation: EDITOR_CANVAS_PORTRAIT },
    { width: 390, height: 844, label: '390x844 (iPhone)', orientation: EDITOR_CANVAS_PORTRAIT },
    { width: 1024, height: 768, label: '1024x768 (Tablet)', orientation: EDITOR_CANVAS_LANDSCAPE },
    { width: 1366, height: 768, label: '1366x768 (Laptop)', orientation: EDITOR_CANVAS_LANDSCAPE },
    { width: 1920, height: 1080, label: '1920x1080 (HD)', orientation: EDITOR_CANVAS_LANDSCAPE },
]

const selectedCanvasSizeLabel = ref(CANVAS_SIZE_PRESETS[0]!.label)
const selectedCanvasSize = computed(() => CANVAS_SIZE_PRESETS.find(size => size.label === selectedCanvasSizeLabel.value) || CANVAS_SIZE_PRESETS[0]!)
const canvasSizeOptions = CANVAS_SIZE_PRESETS.map(size => size.label)

const canvasWidth = computed(() => {
    const size = selectedCanvasSize.value!
    const shouldFlip = canvasOrientation.value !== size.orientation
    return shouldFlip ? size.height : size.width
})

const canvasHeight = computed(() => {
    const size = selectedCanvasSize.value!
    const shouldFlip = canvasOrientation.value !== size.orientation
    return shouldFlip ? size.width : size.height
})

watch(selectedCanvasSizeLabel, () => {
    const size = selectedCanvasSize.value!
    canvasOrientation.value = size.orientation
})

const availableBlocks = ref<Block[]>([
    BLOCK_TEXT_DEFAULT,
    BLOCK_IMAGE_DEFAULT,
])

const staticBlocks = ref<Block[]>([
    STATIC_BLOCK_QR_CODE,
    STATIC_BLOCK_INPUT,
])

const blockContainer = ref<Block[]>([])

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

watch(() => bgImage.value.portrait, () => bgImageToDataURL('portrait'))
watch(() => bgImage.value.landscape, () => bgImageToDataURL('landscape'))

const activeStaticBlocks = ref<string[]>([])

function syncStaticBlock(item: Block) {
    if (!['qr-code', 'input-card'].includes(item.id)) return

    const staticBlock = staticBlocks.value.find(b => b.id === item.id)
    if (!staticBlock) return

    staticBlock.style = structuredClone(toRaw(item.style))
    staticBlock.data = structuredClone(toRaw(item.data))
    staticBlock.compiledStyle = item.compiledStyle
    staticBlock.portraitPos.x = item.portraitPos.x
    staticBlock.portraitPos.y = item.portraitPos.y
    staticBlock.landscapePos.x = item.landscapePos.x
    staticBlock.landscapePos.y = item.landscapePos.y
}

/* ---------------- DRAG FREE POSITION & DRAG ADD BLOCKS ---------------- */
const dragging = ref<string | null>(null)
const draggingBlock = ref<string | null>(null)
const offset = ref<Coordinate>({ x: 0, y: 0 })
const tempPosition = ref<Coordinate>({ x: 0, y: 0 })

function percentToPx(n: number, size: number) {
    return (n / 100) * size
}

function pxToPercent(n: number, size: number) {
    return (n / size) * 100
}

function startDrag(e: MouseEvent, item: Block) {
    dragging.value = item.uid
    selectedUid.value = item.uid

    const orientation = canvasOrientation.value === 'portrait' ? item.portraitPos : item.landscapePos
    offset.value = {
        x: e.clientX - percentToPx(orientation.x, canvasWidth.value) * canvasScale.value,
        y: e.clientY - percentToPx(orientation.y, canvasHeight.value) * canvasScale.value,
    }

    tempPosition.value = { x: orientation.x, y: orientation.y }
}

function onMouseMove(e: MouseEvent) {
    if (!dragging.value) return

    const newXPx = (e.clientX - offset.value.x) / canvasScale.value
    const newYPx = (e.clientY - offset.value.y) / canvasScale.value

    const maxXPercent = Math.max(0, ((canvasWidth.value - 208) / canvasWidth.value) * 100)
    const maxYPercent = Math.max(0, ((canvasHeight.value - 44) / canvasHeight.value) * 100)

    const newX = Math.max(0, Math.min(pxToPercent(newXPx, canvasWidth.value), maxXPercent))
    const newY = Math.max(0, Math.min(pxToPercent(newYPx, canvasHeight.value), maxYPercent))

    tempPosition.value = { x: newX, y: newY }
}

function onBlockDragStart(e: DragEvent, blockId: string) {
    draggingBlock.value = blockId
    if (!e.dataTransfer) return
    e.dataTransfer.effectAllowed = 'copy'
}

function onCanvasDragOver(e: DragEvent) {
    if (!draggingBlock.value) return
    e.preventDefault()
    if (!e.dataTransfer) return
    e.dataTransfer.dropEffect = 'copy'
}

function onCanvasDrop(e: DragEvent) {
    if (!draggingBlock.value) return
    e.preventDefault()

    const block = availableBlocks.value.find(b => b.id === draggingBlock.value)
    if (!block) return

    const canvasRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const xPx = Math.max(0, Math.min((e.clientX - canvasRect.left) / canvasScale.value, canvasWidth.value - 208))
    const yPx = Math.max(0, Math.min((e.clientY - canvasRect.top) / canvasScale.value, canvasHeight.value - 44))
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
            x: canvasOrientation.value === 'portrait' ? x : 0,
            y: canvasOrientation.value === 'portrait' ? y : 0,
        },
        landscapePos: {
            x: canvasOrientation.value === 'landscape' ? x : 0,
            y: canvasOrientation.value === 'landscape' ? y : 0,
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

    const pos = canvasOrientation.value === 'portrait' ? item.portraitPos : item.landscapePos
    pos.x = Math.round(tempPosition.value.x)
    pos.y = Math.round(tempPosition.value.y)

    if (['qr-code', 'input-card'].includes(item.id)) {
        syncStaticBlock(item)
    }

    dragging.value = null
}

onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', stopDrag)
})

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', stopDrag)
})

/* ---------------- SELECT ---------------- */
const selectedUid = ref<string | null>(null)

const selectedItem = computed(() =>
    blockContainer.value.find(i => i.uid === selectedUid.value),
)

const itemPosition = computed(() => (item: Block) => {
    if (dragging.value === item.uid) {
        return tempPosition.value
    }
    const pos = canvasOrientation.value === 'portrait' ? item.portraitPos : item.landscapePos
    return { x: pos.x, y: pos.y }
})

/* ---------------- ACTIONS ---------------- */
function getStyleValue(style: BlockStyle[], key: string): string | boolean | number | undefined {
    return style.find(s => s.key === key)?.value
}

function compileBlockStyle(id: string, style: BlockStyle[]) {
    if (id === 'text') {
        const fontFamily = getStyleValue(style, 'fontSans')
            ? `${getStyleValue(style, 'fontFamily')}, sans-serif`
            : `${getStyleValue(style, 'fontFamily')}, serif`
        const fontSize = String(getStyleValue(style, 'fontSize'))
        const fontWeight = getStyleValue(style, 'fontBold') ? 'bold' : 'normal'
        const fontStyle = getStyleValue(style, 'fontItalic') ? 'italic' : 'normal'
        return `color:${getStyleValue(style, 'textColor')}; font-family:${fontFamily}; font-size:${fontSize}rem; font-weight:${fontWeight}; font-style:${fontStyle};`
    }

    if (id === 'image') {
        const width = String(getStyleValue(style, 'width'))
        const same = getStyleValue(style, 'heightSameAsWidth')
        const height = same ? `${width}px` : `${getStyleValue(style, 'height')}px`
        return `width:${width}px; height:${height};`
    }

    if (id === 'qr-code') {
        const size = String(getStyleValue(style, 'size'))
        return `width:${size}rem; height:${size}rem;`
    }

    if (id === 'input-card') {
        const buttonColor = String(getStyleValue(style, 'buttonColor'))
        const titleFontSize = String(getStyleValue(style, 'titleFontSize'))
        const inputFontSize = String(getStyleValue(style, 'inputFontSize'))
        return `button-color:${buttonColor}; title-font-size:${titleFontSize}rem; input-font-size:${inputFontSize}rem;`
    }

    return ''
}

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
        const block = staticBlocks.value.find(b => b.id === id)
        if (block) {
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
}

function onBgImageUpload(e: Event, orientation: Orientation) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    bgImage.value[orientation] = file
}

function clearBgImage(orientation: Orientation) {
    bgImage.value[orientation] = null
}

function removeCard(uid: string) {
    blockContainer.value = blockContainer.value.filter(i => i.uid !== uid)
}

function duplicateCard(item: Block) {
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
        compiledStyle: compileBlockStyle(item.id, style),
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
        selectedItem.value.compiledStyle = compileBlockStyle(selectedItem.value.id, style)
    }

    if (selectedItem.value && ['qr-code', 'input-card'].includes(selectedItem.value.id)) {
        syncStaticBlock(selectedItem.value)
    }
}

function updateBlockData(key: string, value: string) {
    if (!selectedItem.value) return

    const dataItem = selectedItem.value.data.find(d => d.key === key)
    if (dataItem) {
        dataItem.value = value
    }

    if (['qr-code', 'input-card'].includes(selectedItem.value.id)) {
        syncStaticBlock(selectedItem.value)
    }
}

function updatePosition(key: CoordinateKey, value: number, orientation?: Orientation) {
    if (!selectedItem.value) return

    const targetOrientation = orientation || canvasOrientation.value
    const settings = targetOrientation === 'portrait' ? selectedItem.value.portraitPos : selectedItem.value.landscapePos
    settings[key] = value
    if (['qr-code', 'input-card'].includes(selectedItem.value.id)) {
        syncStaticBlock(selectedItem.value)
    }
}

/* ---------------- HTML GENERATION ---------------- */
function renderBlock(block: Block) {
    if (!block) return ''
    const pos = canvasOrientation.value === 'portrait' ? block.portraitPos : block.landscapePos
    return `
    <div style="position:absolute;left:${pos.x}%;top:${pos.y}%; transform: translate(-50%, -50%);">
        ${block.html(block.data, block.compiledStyle)}
    </div>
    `
}

function _invitationHtml(bgImage: BackgroundImage, width: number, height: number, content: string, staticContent: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @page {
                size: ${width}px ${height}px;
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: flex-start;
            }
            .page {
                width: ${width}px;
                height: ${height}px;
                position: relative;
            }
            .background {
                background-image: url(${bgImage.portraitDataURL});
                background-size: cover;
                background-position: center;
            }
            .viewport {
                width: 100vw;
                display: flex;
                justify-content: center;
            }
            .scaler {
                transform-origin: top center;
                transform: scale(calc(100vw / ${width}));
            }
        </style>
    </head>
    <body>
        <div class="viewport">
            <div class="scaler">
                <div class="page background">
                    ${content}
                    ${staticContent}
                </div>
            </div>
        </div>
    </body>
    </html>
    `
}

function scanPageHtml(bgImage: BackgroundImage, width: number, height: number, content: string, staticContent: string) {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <style>
                .container {
                    position: relative;
                    height: ${height}px;
                    width: ${width}px;
                    overflow: hidden;
                }
                .bg-blur {
                    position: absolute;
                    inset: 0;
                    background-image: var(--bg);
                    background-size: cover;
                    background-position: center;
                    filter: blur(40px) brightness(0.75);
                    transform: scale(1.1);
                }
                .bg-main {
                    position: absolute;
                    inset: 0;
                    background-image: var(--bg);
                    background-size: contain;
                    background-position: center;
                    background-repeat: no-repeat;
                }
                .content {
                    z-index: 1;
                }
                .container.is-lg .bg-blur {
                    background-image: var(--lg-bg);
                }
                .container.is-lg .bg-main {
                    background-image: var(--lg-bg);
                }
            </style>
        </head>
        <body style="margin:0;padding:0;">
            <div class="container ${width >= 1024 ? 'is-lg' : ''}">
                <div
                    class="bg-blur"
                    style="--bg: url(${bgImage.portraitDataURL}); --lg-bg: url(${bgImage.landscapeDataURL});"
                ></div>

                <div
                    class="bg-main"
                    style="--bg: url(${bgImage.portraitDataURL}); --lg-bg: url(${bgImage.landscapeDataURL});"
                ></div>

                <div class="content">
                    ${content}
                    ${staticContent}
                </div>
            </div>
        </body>
    </html>
    `
}

// const generatedHtml = computed(() => {
//     const content = blockContainer.value.map((block) => {
//         if (!block) return ''
//         return renderBlock(block)
//     }).join('\n')
//     const staticContent = activeStaticBlocks.value.map((id) => {
//         const block = staticBlocks.value.find(b => b.id === id)
//         if (!block) return ''
//         return renderBlock(block)
//     }).join('\n')
//     const bgImg = bgImage.value
//     const width = canvasWidth.value
//     const height = canvasHeight.value

//     return scanPageHtml(bgImg, width, height, content, staticContent)
// })

function refreshGeneratedHtml() {
    const content = blockContainer.value.map((block) => {
        if (!block) return ''
        return renderBlock(block)
    }).join('\n')
    const staticContent = activeStaticBlocks.value.map((id) => {
        const block = staticBlocks.value.find(b => b.id === id)
        if (!block) return ''
        return renderBlock(block)
    }).join('\n')
    const bgImg = bgImage.value
    const width = canvasWidth.value
    const height = canvasHeight.value

    generatedHtml.value = scanPageHtml(bgImg, width, height, content, staticContent)
    loadingPreview.value = false
}

const generatedHtml = ref('')
const loadingPreview = ref(false)
let previewTimeout: ReturnType<typeof setTimeout>

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

function saveToLocalStorage() {
    const customBlock: SavedBlockSettings[] = []
    const staticBlock: SavedBlockSettings[] = []

    const customBlockList = blockContainer.value.filter(b => !['qr-code', 'input-card'].includes(b.id))
    for (let i = 0; i < customBlockList.length; i++) {
        const block = customBlockList[i]
        if (!block) continue

        customBlock.push({
            id: block.id,
            style: block.style.map(b => ({ key: b.key, value: b.value })),
            data: block.data.map(b => ({ key: b.key, value: b.value })),
            portraitPos: structuredClone(toRaw(block.portraitPos)),
            landscapePos: structuredClone(toRaw(block.landscapePos)),
            compiledStyle: compileBlockStyle(block.id, block.style),
        })
    }

    const staticBlockList = staticBlocks.value
    for (let i = 0; i < staticBlockList.length; i++) {
        const block = staticBlockList[i]
        if (!block) continue

        staticBlock.push({
            id: block.id,
            style: block.style.map(b => ({ key: b.key, value: b.value })),
            data: block.data.map(b => ({ key: b.key, value: b.value })),
            portraitPos: structuredClone(toRaw(block.portraitPos)),
            landscapePos: structuredClone(toRaw(block.landscapePos)),
            compiledStyle: compileBlockStyle(block.id, block.style),
        })
    }

    const settings = {
        bgPortraitDataURL: bgImage.value.portraitDataURL,
        bgLandscapeDataURL: bgImage.value.landscapeDataURL,
        customBlock,
        staticBlock,
    } as SavedSetttings

    localStorage.setItem('editor-config', JSON.stringify(settings))
}

function preview() {
    if (!import.meta.client) return

    saveToLocalStorage()
    window.open('/check-in', '_blank', 'noopener,noreferrer')
}

definePageMeta({
    layout: 'clean',
})
</script>

<template>
    <div class="flex flex-col p-8">
        <div class="flex justify-between mb-4">
            <h2>Editor</h2>
            <div class="flex gap-4">
                <UButton
                    class="cursor-pointer"
                    label="Refresh Preview"
                    :disabled="loadingPreview"
                    @click="refreshGeneratedHtml"
                />

                <UButton
                    class="cursor-pointer"
                    label="Preview"
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
                                class="w-full"
                            />
                        </UFormField>
                    </div>

                    <div class="mb-4">
                        <UFormField label="Size">
                            <USelect
                                v-model="selectedCanvasSizeLabel"
                                :items="canvasSizeOptions"
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
                            v-for="card in availableBlocks"
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
                <UCard :ui="{ body: 'p-2 sm:p-3' }">
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
                                            {{ availableBlocks.find(c => c.id === item.id)?.label || staticBlocks.find(c => c.id === item.id)?.label }}

                                            <div
                                                v-if="!['qr-code', 'input-card'].includes(item.id)"
                                                class="flex gap-2"
                                            >
                                                <UButton
                                                    size="xs"
                                                    label="Dup"
                                                    @click.stop="duplicateCard(item)"
                                                />
                                                <UButton
                                                    size="xs"
                                                    color="error"
                                                    label="Del"
                                                    @click.stop="removeCard(item.uid)"
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

                    <div class="mb-4">
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

                    <div class="mb-4">
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

                        <div class="mb-4">
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

                        <div class="mb-4">
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
                                    :model-value="Boolean(getStyleValue(selectedItem.style, field.key))"
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
                                        :model-value="String(getStyleValue(selectedItem.style, field.key))"
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
                                                    :style="{ backgroundColor: String(getStyleValue(selectedItem.style, field.key)) }"
                                                    class="size-3 rounded-full"
                                                />
                                            </template>
                                        </UButton>

                                        <template #content>
                                            <UColorPicker
                                                :model-value="String(getStyleValue(selectedItem.style, field.key))"
                                                @update:model-value="(e) => selectedItem && setStyleValue(selectedItem.style, field.key, e || '#000000')"
                                            />
                                        </template>
                                    </UPopover>

                                    <UInput
                                        v-else-if="field.type === 'number'"
                                        type="number"
                                        :model-value="Number(getStyleValue(selectedItem.style, field.key))"
                                        class="w-full"
                                        :step="0.1"
                                        @update:model-value="(e) => selectedItem && setStyleValue(selectedItem.style, field.key, e)"
                                    />

                                    <UInput
                                        v-else
                                        :type="field.type"
                                        :model-value="String(getStyleValue(selectedItem.style, field.key))"
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
