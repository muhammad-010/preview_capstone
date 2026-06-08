<script setup lang="ts">
const props = defineProps<{
    editorMode: EditorMode
    customBlocks: ElementBlock[]
    staticBlocks: ElementBlock[]
    canvasSizeOptions: CanvasSize[]

    defaultSelectedCanvasSizeIds: Breakpoint[]
    defaultActiveCanvasSizeId: Breakpoint
    defaultOrientation: Orientation
    defaultSelectedBlocks: ElementBlock[]
    defaultActiveStaticBlocks: string[]

    withPreview?: boolean
    htmlPreviewFn?: (bgImage: BackgroundImage, width: number, height: number, content: string, staticContent: string) => string
    previewPath?: string
    previewKey?: string

    canvasImageBased?: boolean

    pageTitle?: string
    defaultScale?: number
}>()

const DRAG_X_LIMIT = 10
const DRAG_Y_LIMIT = 10
const DRAG_DATATRANSFER_COPY = 'copy'
const EVENT_MOUSEMOVE = 'mousemove'
const EVENT_MOUSEUP = 'mouseup'
const MAX_FILE_SIZE = 1024 * 1024 // 1MB

const router = useRouter()
const toast = useToast()

// CANVAS SIZE
const selectCanvasSizePopover = ref<boolean>(false)
const selectedCanvasSizeIds = ref<Breakpoint[]>(props.defaultSelectedCanvasSizeIds)
const removeCanvasSizeModal = ref<boolean>(false)
const removeCanvasSizeTarget = ref<Breakpoint | null>(null)
const activeCanvasSizeId = ref<Breakpoint>(props.defaultActiveCanvasSizeId)
const activeCanvasSize = computed(() => props.canvasSizeOptions.find(c => c.id === activeCanvasSizeId.value)!)
const selectedCanvasSizes = computed(() => selectedCanvasSizeIds.value.reduce<typeof props.canvasSizeOptions>((acc, id) => {
    const found = props.canvasSizeOptions.find(c => c.id === id)
    if (found) acc.push(found)
    return acc
}, []))
const unselectedCanvasSizes = computed(() => props.canvasSizeOptions.filter(c => !selectedCanvasSizeIds.value.includes(c.id)))
const removeCanvasSizesTarget = computed(() => props.canvasSizeOptions.find(c => c.id === removeCanvasSizeTarget.value)?.label ?? '')

function addCanvasSize(id: Breakpoint) {
    if (selectedCanvasSizeIds.value.includes(id)) return
    selectedCanvasSizeIds.value.push(id)
    activeCanvasSizeId.value = id
    selectCanvasSizePopover.value = false
}

function confirmRemoveCanvasSize(id: Breakpoint) {
    if (selectedCanvasSizeIds.value.length === 1) return
    removeCanvasSizeTarget.value = id
    removeCanvasSizeModal.value = true
}

function toggleActiveCanvasSize(id: Breakpoint) {
    if (!selectedCanvasSizeIds.value.includes(id)) return
    activeCanvasSizeId.value = id
}

function removeCanvasSize() {
    if (!removeCanvasSizeTarget.value || selectedCanvasSizeIds.value.length === 1) return

    const id = removeCanvasSizeTarget.value
    const index = selectedCanvasSizeIds.value.indexOf(id)
    if (index === -1) return

    const candidate = index + 1 === selectedCanvasSizeIds.value.length
        ? selectedCanvasSizeIds.value[index - 1]
        : selectedCanvasSizeIds.value[index + 1]
    if (!candidate) return

    selectedCanvasSizeIds.value.splice(index, 1)
    removeCanvasSizeModal.value = false

    if (!(activeCanvasSizeId.value === id)) return
    toggleActiveCanvasSize(candidate)
}

// BACKGROUND IMAGE
const bgImage = ref<ElementBackgroundImage>({
    dataUrl: '',
    width: 0,
    height: 0,
    perBreakpoint: props.canvasSizeOptions.reduce((acc, cur) => {
        acc[cur.id] = {
            dataUrl: '',
            width: 0,
            height: 0,
        }
        return acc
    }, {} as Partial<Record<Breakpoint, BackgroundImage>>),
})
const activeBgImage = computed<BackgroundImage | undefined>(() => {
    if (!bgImage.value.perBreakpoint || !bgImage.value.perBreakpoint[activeCanvasSizeId.value]) return

    return bgImage.value.perBreakpoint![activeCanvasSizeId.value]!
})

function clearImage(remove: (index?: number | undefined) => void, index?: number | undefined) {
    remove(index)
    if (!bgImage.value.perBreakpoint || !bgImage.value.perBreakpoint[activeCanvasSizeId.value]) return

    bgImage.value.perBreakpoint![activeCanvasSizeId.value] = {
        dataUrl: '',
        width: 0,
        height: 0,
    }
}

watch(
    () => bgImage.value.perBreakpoint?.[activeCanvasSizeId.value]?.file,
    (file) => {
        if (!file || !bgImage.value.perBreakpoint || !bgImage.value.perBreakpoint[activeCanvasSizeId.value]) return
        if (file.size > MAX_FILE_SIZE) {
            toast.add({
                title: 'Background Exceed Limit',
                description: 'Max file limit are 1MB',
                color: 'error',
            })
            bgImage.value.perBreakpoint![activeCanvasSizeId.value]!.file = undefined
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const img = new Image()
            img.onload = () => {
                bgImage.value.perBreakpoint![activeCanvasSizeId.value]!.width = img.width
                bgImage.value.perBreakpoint![activeCanvasSizeId.value]!.height = img.height

                if (props.canvasSizeOptions) {
                    canvasOrientation.value = img.width > img.height ? EDITOR_CANVAS_LANDSCAPE : EDITOR_CANVAS_PORTRAIT
                }
            }
            const src = reader.result as string
            img.src = src
            bgImage.value.perBreakpoint![activeCanvasSizeId.value]!.dataUrl = src
        }
        bgImage.value.perBreakpoint![activeCanvasSizeId.value]!.name = file.name
        reader.readAsDataURL(file)
    },
    { deep: true },
)

// CANVAS SCALE
const canvasScalePercentage = ref(Math.round((props.defaultScale || EDITOR_CANVAS_SCALE) * 100))
const canvasScale = computed(() => canvasScalePercentage.value / 100)

// CANVAS ORIENTATION
function shouldFlipCanvas(canvasOrientation: Orientation, activeOrientation: Orientation) {
    return canvasOrientation !== activeOrientation
}
const canvasOrientation = ref<Orientation>(props.defaultOrientation)
const canvasWidth = computed(() => {
    if (props.canvasImageBased && activeBgImage.value && activeBgImage.value.width) {
        return activeBgImage.value.width
    }
    const canvasSize = activeCanvasSize.value!
    return shouldFlipCanvas(canvasOrientation.value, activeCanvasSize.value.orientation) ? canvasSize.height : canvasSize.width
})
const canvasHeight = computed(() => {
    if (props.canvasImageBased && activeBgImage.value && activeBgImage.value.height) {
        return activeBgImage.value.height
    }
    const canvasSize = activeCanvasSize.value
    return shouldFlipCanvas(canvasOrientation.value, activeCanvasSize.value.orientation) ? canvasSize.width : canvasSize.height
})
const canvasOrientationSelections = props.canvasImageBased
    ? [props.defaultOrientation]
    : [EDITOR_CANVAS_PORTRAIT, EDITOR_CANVAS_LANDSCAPE]
watch(activeCanvasSizeId, () => {
    canvasOrientation.value = activeCanvasSize.value.orientation
})

const canvasStyle = computed(() => ({
    width: canvasWidth.value + 'px',
    height: canvasHeight.value + 'px',
    transform: `scale(${canvasScale.value})`,
    transformOrigin: 'top left',
}))

// BLOCKS
const blockContainer = ref<ElementBlock[]>(props.defaultSelectedBlocks)
const activeStaticBlocks = ref<string[]>(props.defaultActiveStaticBlocks)

function findCustomBlock(id: string) {
    return props.customBlocks.find(b => b.id === id)
}

function findStaticBlock(id: string) {
    return props.staticBlocks.find(b => b.id === id)
}

function checkStaticBlock(id: string) {
    return props.staticBlocks.some(b => b.id === id)
}

function checkCustomBlock(id: string) {
    return props.customBlocks.some(b => b.id === id)
}

function syncStaticBlock(block: ElementBlock) {
    if (!checkStaticBlock(block.id)) return

    const staticBlock = findStaticBlock(block.id)
    if (!staticBlock) return

    staticBlock.style = cloneObject(block.style)
    staticBlock.setting = cloneObject(block.setting)
    staticBlock.x = block.x
    staticBlock.y = block.y
    staticBlock.perBreakpoint = cloneObject(block.perBreakpoint)
}

// DRAG BLOCKS
const selectedUid = ref<string | null>(null)
const draggingCanvasBlock = ref<string | null>(null)
const draggingBlock = ref<string | null>(null)
const offset = ref<Coordinate>({ x: 0, y: 0 })
const tempPosition = ref<Coordinate>({ x: 0, y: 0 })

function dragCanvasBlock(e: MouseEvent, uid: string, item: Block) {
    draggingCanvasBlock.value = uid
    selectedUid.value = uid

    offset.value = {
        x: e.clientX - percentToPx(item.x, canvasWidth.value) * canvasScale.value,
        y: e.clientY - percentToPx(item.y, canvasHeight.value) * canvasScale.value,
    }

    tempPosition.value = { x: item.x, y: item.y }
}

function startDragCustomBlock(e: DragEvent, blockId: string) {
    draggingBlock.value = blockId
    if (!e.dataTransfer) return
    e.dataTransfer.effectAllowed = DRAG_DATATRANSFER_COPY
}

function dragToCanvas(e: DragEvent) {
    if (!draggingBlock.value) return
    e.preventDefault()
    if (!e.dataTransfer) return
    e.dataTransfer.dropEffect = DRAG_DATATRANSFER_COPY
}

function dropCanvas(e: DragEvent) {
    if (!draggingBlock.value) return
    e.preventDefault()

    const block = findCustomBlock(draggingBlock.value)
    if (!block) return

    const canvasRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const xPx = Math.max(0, Math.min((e.clientX - canvasRect.left) / canvasScale.value, canvasWidth.value - DRAG_X_LIMIT))
    const yPx = Math.max(0, Math.min((e.clientY - canvasRect.top) / canvasScale.value, canvasHeight.value - DRAG_Y_LIMIT))
    const h = Math.round(pxToPercent(yPx, canvasHeight.value))
    const w = Math.round(pxToPercent(xPx, canvasWidth.value))
    const uid = `${Date.now()}`

    const newBlock: ElementBlock = {
        ...block,
        uid,
        setting: cloneObject(block.setting),
        style: cloneObject(block.style),
        x: w,
        y: h,
        perBreakpoint: {},
    }
    props.canvasSizeOptions.forEach((c) => {
        const b: Block = {
            uid: uid,
            id: block.id,
            value: block.value,
            setting: cloneObject(block.setting),
            style: cloneObject(block.style),
            x: w,
            y: h,
        }
        const shouldFlip = shouldFlipCanvas(c.orientation, activeCanvasSize.value.orientation)
        b.x = shouldFlip ? h : w
        b.y = shouldFlip ? w : h
        newBlock.perBreakpoint![c.id] = b
    })
    blockContainer.value.push(newBlock)

    selectedUid.value = uid
    draggingBlock.value = null
}

function startMoveCanvasBlock(e: MouseEvent) {
    if (!draggingCanvasBlock.value) return

    const newXPx = (e.clientX - offset.value.x) / canvasScale.value
    const newYPx = (e.clientY - offset.value.y) / canvasScale.value

    const maxXPercent = Math.max(0, ((canvasWidth.value - DRAG_X_LIMIT) / canvasWidth.value) * 100)
    const maxYPercent = Math.max(0, ((canvasHeight.value - DRAG_Y_LIMIT) / canvasHeight.value) * 100)

    const newX = Math.max(0, Math.min(pxToPercent(newXPx, canvasWidth.value), maxXPercent))
    const newY = Math.max(0, Math.min(pxToPercent(newYPx, canvasHeight.value), maxYPercent))

    tempPosition.value = { x: newX, y: newY }
}

function stopMoveCanvasBlock() {
    if (!draggingCanvasBlock.value) return

    const block = blockContainer.value.find(i => i.uid === draggingCanvasBlock.value)
    if (!block || !block.perBreakpoint || !block.perBreakpoint[activeCanvasSizeId.value]) return

    block.perBreakpoint[activeCanvasSizeId.value]!.x = Math.round(tempPosition.value.x)
    block.perBreakpoint[activeCanvasSizeId.value]!.y = Math.round(tempPosition.value.y)

    if (checkStaticBlock(block.id)) {
        syncStaticBlock(block)
    }

    draggingCanvasBlock.value = null
}

onMounted(() => {
    window.addEventListener(EVENT_MOUSEMOVE, startMoveCanvasBlock)
    window.addEventListener(EVENT_MOUSEUP, stopMoveCanvasBlock)
})

onBeforeUnmount(() => {
    window.removeEventListener(EVENT_MOUSEMOVE, startMoveCanvasBlock)
    window.removeEventListener(EVENT_MOUSEUP, stopMoveCanvasBlock)
})

// BLOCK MANIPULATIONS
const selectedItem = computed(() =>
    blockContainer.value.find(i => i.uid === selectedUid.value),
)
const itemPosition = computed(() => (uid: string, block: Block) => {
    if (draggingCanvasBlock.value === uid) return tempPosition.value
    return { x: block.x, y: block.y }
})

onMounted(() => {
    props.staticBlocks.forEach((b) => {
        const block = cloneObject(b)
        block.perBreakpoint = {}
        props.canvasSizeOptions.forEach((c) => {
            block.perBreakpoint![c.id] = {
                uid: b.uid,
                id: b.id,
                value: b.value,
                setting: cloneObject(b.setting),
                style: cloneObject(b.style),
                x: b.x,
                y: b.y,
            }
        })
        syncStaticBlock(block)
    })
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
        const block = findStaticBlock(id)
        if (!block) return

        blockContainer.value.push({
            ...block,
            setting: cloneObject(block.setting),
            style: cloneObject(block.style),
            perBreakpoint: cloneObject(block.perBreakpoint),
        })
        selectedUid.value = id
    }
}

function duplicateBlock(block: ElementBlock) {
    const newBlock: ElementBlock = {
        ...block,
        uid: `${Date.now()}`,
        setting: cloneObject(block.setting),
        style: cloneObject(block.style),
        x: block.x + 5,
        y: block.y + 5,
        perBreakpoint: cloneObject(block.perBreakpoint),
    }
    if (newBlock.perBreakpoint) {
        Object.entries(newBlock.perBreakpoint).forEach(([bp, _]) => {
            if (!isBreakpoint(bp)) return
            if (!newBlock.perBreakpoint![bp]) return

            newBlock.perBreakpoint![bp].x += 5
            newBlock.perBreakpoint![bp].y += 5
        })
    }
    blockContainer.value.push(newBlock)
}

function removeBlock(uid: string) {
    blockContainer.value = blockContainer.value.filter(i => i.uid !== uid)
}

function endDragCustomBlock() {
    draggingBlock.value = null
}

function updateBlock(
    target: 'position' | 'setting' | 'style',
    key: CoordinateKey | string,
    value: string | boolean | number,
) {
    if (
        !selectedItem.value
        || !selectedItem.value.perBreakpoint
        || !activeCanvasSizeId.value
        || !selectedItem.value.perBreakpoint[activeCanvasSizeId.value]
    ) return

    if (target === 'position') {
        selectedItem.value.perBreakpoint[activeCanvasSizeId.value]![key as CoordinateKey] = Number(value)
    }
    else {
        let dataItem: BlockSetting | undefined
        switch (target) {
            case 'setting':
                dataItem = selectedItem.value.setting.find(s => s.key === key)
                break
            case 'style':
                dataItem = selectedItem.value.perBreakpoint[activeCanvasSizeId.value]!.style.find(s => s.key === key)
                break
            default:
                return
        }

        if (!dataItem) return
        dataItem.value = value
    }

    if (checkStaticBlock(selectedItem.value.id)) {
        syncStaticBlock(selectedItem.value)
    }
}

// HTML GENERATION
const generatedHtml = ref('')
const loadingPreview = ref(false)
let previewTimeout: ReturnType<typeof setTimeout>

function renderBlock(block: Block, value: string | boolean | number) {
    if (!block) return ''
    const absoluteStyle = getPositionStyle(block)
    return `
    <div style="${absoluteStyle}">
        ${renderPreviewHtml(block, value, compilePreviewStyle(block))}
    </div>
    `
}

function getrenderPreviewHtml(bgImage: BackgroundImage, width: number, height: number, content: string, staticContent: string) {
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
    const customContent = blockContainer.value.map((block) => {
        if (!block || !block.perBreakpoint || !block.perBreakpoint[activeCanvasSizeId.value]) return ''
        return renderBlock(block.perBreakpoint[activeCanvasSizeId.value]!, block.value)
    }).join('\n')
    const staticContent = activeStaticBlocks.value.map((id) => {
        const block = findStaticBlock(id)
        if (!block || !block.perBreakpoint || !block.perBreakpoint[activeCanvasSizeId.value]) return ''
        return renderBlock(block.perBreakpoint[activeCanvasSizeId.value]!, block.value)
    }).join('\n')
    const bgImg = !bgImage.value.perBreakpoint || !bgImage.value.perBreakpoint[activeCanvasSizeId.value]
        ? { dataUrl: '' } as BackgroundImage
        : bgImage.value.perBreakpoint[activeCanvasSizeId.value]!

    generatedHtml.value = getrenderPreviewHtml(bgImg, canvasWidth.value, canvasHeight.value, customContent, staticContent)
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
function reduceElementBlockPerBreakpoint(bp: Breakpoint): (blocks: ElementBlock[], block: ElementBlock) => ElementBlock[] {
    return (blocks: ElementBlock[], block: ElementBlock): ElementBlock[] => {
        if (!block.perBreakpoint || !block.perBreakpoint[bp]) return blocks

        const bpBlock: Block = block.perBreakpoint[bp]!
        blocks.push({
            ...block,
            style: cloneObject(bpBlock.style),
            setting: cloneObject(bpBlock.setting),
            x: bpBlock.x,
            y: bpBlock.y,
            perBreakpoint: undefined,
        })

        return blocks
    }
}

function saveToLocalStorage() {
    if (!props.previewKey) return

    const settings: SavedVariant[] = selectedCanvasSizes.value.map((size) => {
        const slug = size.id
        const reducer = reduceElementBlockPerBreakpoint(slug)

        const customBlock = blockContainer.value
            .filter(b => checkCustomBlock(b.id))
            .reduce<ElementBlock[]>(reducer, [])

        const staticBlock = props.staticBlocks
            .filter(b => checkStaticBlock(b.id))
            .reduce<ElementBlock[]>(reducer, [])

        return {
            bgImage: bgImage.value.perBreakpoint?.[slug]?.dataUrl || '',
            slug: props.editorMode === EDITOR_MODE_INVITATION_EMAIL && slug === BREAKPOINT_MD ? 'default' : slug,
            customBlock,
            staticBlock,
        }
    })

    localStorage.setItem(props.previewKey, JSON.stringify(settings))
}

function preview() {
    if (!import.meta.client || !props.previewPath) return

    saveToLocalStorage()
    window.open(props.previewPath, '_blank', 'noopener,noreferrer')
}
</script>

<template>
    <div class="flex flex-col p-4">
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
                            <UInputNumber
                                v-model="canvasScalePercentage"
                                :min="10"
                                :max="100"
                                class="w-full"
                            />
                        </UFormField>
                    </div>

                    <div
                        v-if="!canvasImageBased"
                        class="mb-4"
                    >
                        <UFormField label="Orientation">
                            <USelect
                                v-model="canvasOrientation"
                                :items="canvasOrientationSelections"
                                class="w-full"
                            />
                        </UFormField>
                    </div>
                </UCard>

                <!-- VARIANTS -->
                <UCard
                    v-if="canvasSizeOptions.length > 1"
                    :ui="{ body: 'p-2 sm:p-3' }"
                >
                    <template #header>
                        <h3>Page Sizes</h3>
                    </template>
                    <div class="space-y-2">
                        <div
                            v-for="canvas in selectedCanvasSizes"
                            :key="`selcanvar-${canvas.id}`"
                            class="flex items-center gap-2 py-2 px-4 border-2 rounded-lg w-52"
                            :class="activeCanvasSizeId === canvas.id ? 'border-primary-500 dark:border-primary-400' : 'border-neutral-950/25 dark:border-neutral-50/25'"
                        >
                            <UIcon
                                :name="activeCanvasSizeId === canvas.id ? 'lucide:eye' : 'lucide:eye-off'"
                                :class="`cursor-pointer ${activeCanvasSizeId === canvas.id && selectedCanvasSizes.length > 1 ? 'text-primary' : 'text-dimmed'}`"
                                @click="toggleActiveCanvasSize(canvas.id)"
                            />
                            {{ canvas.label }}
                            <UIcon
                                name="lucide:trash"
                                :class="`cursor-pointer ${selectedCanvasSizes.length > 1 ? 'text-error' : 'text-dimmed'} ml-auto`"
                                @click="confirmRemoveCanvasSize(canvas.id)"
                            />
                        </div>
                        <UPopover v-model:open="selectCanvasSizePopover">
                            <UButton
                                icon="lucide:plus"
                                color="neutral"
                                variant="outline"
                                class="w-52"
                                :disabled="!unselectedCanvasSizes.length"
                            />

                            <template #content>
                                <div class="p-2">
                                    <UFieldGroup orientation="vertical">
                                        <div
                                            v-for="canvas in unselectedCanvasSizes"
                                            :key="`unselcanvar-${canvas.id}`"
                                            class="cursor-pointer flex items-center gap-2 py-2 px-4 border border-neutral-950/25 dark:border-neutral-50/25 hover:border-primary first:rounded-t last:rounded-b w-52"
                                            @click="addCanvasSize(canvas.id)"
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
                    v-model:open="removeCanvasSizeModal"
                    title="Remove Variant"
                    :body="`Are you sure want to delete variant ${removeCanvasSizesTarget}? All your changes will be deleted and can not restored.`"
                    @confirm="() => removeCanvasSize()"
                />

                <!-- BLOCKS -->
                <UCard :ui="{ body: 'p-2 sm:p-3' }">
                    <template #header>
                        <h3>Blocks</h3>
                    </template>
                    <div class="space-y-2">
                        <EditorBlock
                            v-for="card in customBlocks"
                            :key="card.id"
                            draggable
                            hoverable
                            :label="card.label"
                            class="cursor-move"
                            @dragstart="startDragCustomBlock($event, card.id)"
                            @dragend="endDragCustomBlock"
                        />
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
                        <EditorBlock
                            v-for="block in staticBlocks"
                            :key="block.id"
                            class="flex items-center justify-between"
                        >
                            <span>{{ block.label }}</span>
                            <UCheckbox
                                :model-value="activeStaticBlocks.includes(block.id)"
                                @update:model-value="toggleStaticBlock(block.id)"
                            />
                        </EditorBlock>
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
            <div class="col-span-5 overflow-auto p-4 scrollbar">
                <div :class="canvasOrientation === 'portrait' ? 'flex gap-4 justify-evenly items-center min-h-full min-w-full' : 'flex flex-col gap-4 justify-evenly items-center min-h-full min-w-full'">
                    <!-- CANVAS -->
                    <div class="relative">
                        <EditorCanvasContainer
                            class="bg-neutral-100 dark:bg-neutral-900"
                            :width="`${canvasWidth * canvasScale}px`"
                            :height="`${canvasHeight * canvasScale}px`"
                            @dragover="dragToCanvas"
                            @drop="dropCanvas"
                        >
                            <div :style="canvasStyle">
                                <template
                                    v-for="block in blockContainer"
                                    :key="block.uid"
                                >
                                    <div
                                        v-if="block.perBreakpoint && block.perBreakpoint[activeCanvasSizeId]"
                                        class="absolute cursor-move"
                                        :style="{
                                            left: itemPosition(block.uid, block.perBreakpoint[activeCanvasSizeId]!).x + '%',
                                            top: itemPosition(block.uid, block.perBreakpoint[activeCanvasSizeId]!).y + '%',
                                        }"
                                        @mousedown.prevent="dragCanvasBlock($event, block.uid, block.perBreakpoint[activeCanvasSizeId]!)"
                                        @click.stop="selectedUid = block.uid"
                                    >
                                        <UChip position="top-left">
                                            <EditorBlock
                                                class="flex items-center justify-between"
                                                :class="[
                                                    selectedUid === block.uid ? 'border-neutral-500 dark:border-neutral-400' : '',
                                                ]"
                                            >
                                                {{ findCustomBlock(block.id)?.label || findStaticBlock(block.id)?.label }}

                                                <div
                                                    v-if="checkCustomBlock(block.id)"
                                                    class="flex gap-2"
                                                >
                                                    <UButton
                                                        size="xs"
                                                        label="Dup"
                                                        @click.stop="duplicateBlock(block)"
                                                    />
                                                    <UButton
                                                        size="xs"
                                                        color="error"
                                                        label="Del"
                                                        @click.stop="removeBlock(block.uid)"
                                                    />
                                                </div>
                                            </EditorBlock>
                                        </UChip>
                                    </div>
                                </template>
                            </div>
                        </EditorCanvasContainer>
                    </div>

                    <!-- PREVIEW -->
                    <MiscLoadingOverlay :loading="loadingPreview">
                        <EditorCanvasContainer
                            :width="`${canvasWidth * canvasScale}px`"
                            :height="`${canvasHeight * canvasScale}px`"
                        >
                            <iframe
                                :style="{ ...canvasStyle, border: 'none' }"
                                :srcdoc="generatedHtml"
                            />
                        </EditorCanvasContainer>
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
                            Background Image (Max 1MB)
                        </h4>

                        <template v-if="bgImage.perBreakpoint && bgImage.perBreakpoint[activeCanvasSizeId]">
                            <UFileUpload
                                v-slot="{ open, removeFile }"
                                v-model="bgImage.perBreakpoint![activeCanvasSizeId]!.file"
                                accept="image/*"
                            >
                                <UFieldGroup>
                                    <UInput
                                        readonly
                                        :model-value="bgImage.perBreakpoint![activeCanvasSizeId]!.file ? bgImage.perBreakpoint![activeCanvasSizeId]!.name : 'Choose Image'"
                                        :ui="{ base: 'cursor-pointer' }"
                                        @click="open()"
                                    />
                                    <UButton
                                        :disabled="!Boolean(bgImage.perBreakpoint![activeCanvasSizeId]!.file)"
                                        icon="lucide:x"
                                        :color="!Boolean(bgImage.perBreakpoint![activeCanvasSizeId]!.file) ? 'neutral' : 'error'"
                                        @click="clearImage(removeFile)"
                                    />
                                </UFieldGroup>

                                <p
                                    v-if="bgImage.perBreakpoint![activeCanvasSizeId]!.file"
                                    class="text-sm text-muted mt-2"
                                >
                                    width: {{ bgImage.perBreakpoint![activeCanvasSizeId]!.width }}
                                    height: {{ bgImage.perBreakpoint![activeCanvasSizeId]!.height }}
                                </p>
                            </UFileUpload>
                        </template>
                    </div>
                </UCard>

                <template v-if="selectedItem">
                    <!-- SETTINGS -->
                    <UCard :ui="{ body: 'p-2 sm:p-3' }">
                        <template #header>
                            <h3>Block Settings</h3>
                        </template>

                        <div
                            v-if="selectedItem.withValue"
                            class="mb-4"
                        >
                            <UFormField label="Value">
                                <UInput
                                    v-model="selectedItem.value"
                                />
                            </UFormField>
                        </div>
                        <div
                            v-if="selectedItem.editableData"
                            class="mb-4"
                        >
                            <EditorDynamicInput
                                v-for="setting in selectedItem.setting"
                                :key="setting.key"
                                class="mb-4"
                                :field="setting"
                                @update="(e) => updateBlock('setting', setting.key, e)"
                            />
                        </div>
                    </UCard>

                    <!-- STYLE -->
                    <UCard :ui="{ body: 'p-2 sm:p-3' }">
                        <template #header>
                            <h3>Block Styles</h3>
                        </template>

                        <template
                            v-if="selectedItem.perBreakpoint && selectedItem.perBreakpoint[activeCanvasSizeId]"
                        >
                            <div class="mb-4">
                                <h4 class="text-sm font-medium mb-2">
                                    Position
                                </h4>
                                <div class="grid grid-cols-2 gap-2">
                                    <UFormField label="X (%)">
                                        <UInputNumber
                                            :model-value="selectedItem.perBreakpoint[activeCanvasSizeId]!.x"
                                            :step="0.2"
                                            :min="0"
                                            :max="100"
                                            @update:model-value="(value: any) => updateBlock('position', 'x', Number(value))"
                                        />
                                    </UFormField>
                                    <UFormField label="Y (%)">
                                        <UInputNumber
                                            :model-value="selectedItem.perBreakpoint[activeCanvasSizeId]!.y"
                                            :step="0.2"
                                            :min="0"
                                            :max="100"
                                            @update:model-value="(value: any) => updateBlock('position', 'y', Number(value))"
                                        />
                                    </UFormField>
                                </div>
                            </div>

                            <EditorDynamicInput
                                v-for="style in selectedItem.perBreakpoint[activeCanvasSizeId]!.style"
                                :key="style.key"
                                class="mb-4"
                                :field="style"
                                @update="(e) => selectedItem && updateBlock('style', style.key, e)"
                            />
                        </template>
                    </UCard>
                </template>
            </div>
        </div>
    </div>
</template>

