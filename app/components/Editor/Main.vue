<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
    templateId?: number

    customBlocks: ElementBlock[]
    staticBlocks: ElementBlock[]
    canvasSizeOptions: CanvasSize[]
    fontOptions: TemplateFont[]

    defaultSelectedCanvasSizeIds: Breakpoint[]
    defaultActiveCanvasSizeId: Breakpoint
    defaultOrientation: Orientation
    defaultSelectedBlocks: ElementBlock[]
    defaultActiveStaticBlocks: string[]
    defaultBackgroundImages: Partial<Record<Breakpoint, BackgroundImage>>

    withPreview?: boolean
    htmlPreviewFn?: (
        bgImage: BackgroundImage,
        width: number,
        height: number,
        content: string,
        staticContent: string,
        fontFaces: string,
    ) => string
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
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

const router = useRouter()
const toast = useToast()
const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
const emit = defineEmits([EMIT_EDITOR_REFRESH])

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
const bgImage = ref<Partial<Record<Breakpoint, BackgroundImage>>>(props.defaultBackgroundImages)
const activeBgImage = computed<BackgroundImage | undefined>(() => {
    if (!bgImage.value || !bgImage.value[activeCanvasSizeId.value]) return

    return bgImage.value[activeCanvasSizeId.value]!
})

function clearImage(remove: (index?: number | undefined) => void, index?: number | undefined) {
    remove(index)
    if (!bgImage.value || !bgImage.value[activeCanvasSizeId.value]) return

    bgImage.value[activeCanvasSizeId.value] = {
        dataUrl: '',
        uploadKey: '',
        name: undefined,
        width: 0,
        height: 0,
    }
}

watch(
    () => bgImage.value?.[activeCanvasSizeId.value]?.file,
    async (file) => {
        if (!file || !bgImage.value || !bgImage.value[activeCanvasSizeId.value]) return
        if (file.size > MAX_FILE_SIZE) {
            toast.add({
                title: 'Background Exceed Limit',
                description: 'Max file limit are 2MB',
                color: 'error',
            })
            bgImage.value[activeCanvasSizeId.value]!.file = undefined
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const img = new Image()
            img.onload = () => {
                bgImage.value[activeCanvasSizeId.value]!.width = img.width
                bgImage.value[activeCanvasSizeId.value]!.height = img.height

                if (props.canvasSizeOptions) {
                    canvasOrientation.value = img.width > img.height ? EDITOR_CANVAS_LANDSCAPE : EDITOR_CANVAS_PORTRAIT
                }
            }
            const src = reader.result as string
            img.src = src
            bgImage.value[activeCanvasSizeId.value]!.dataUrl = src
        }
        bgImage.value[activeCanvasSizeId.value]!.name = file.name
        reader.readAsDataURL(file)

        const body = new FormData()
        body.append('file', file)
        try {
            const data = await $api(`/api/upload/media`, {
                method: 'POST',
                body,
            })
            if (data.success) {
                successToast({ description: 'Background image uploaded' })
                bgImage.value[activeCanvasSizeId.value]!.uploadKey = data.data.upload_key
            }
            else {
                errorToast({ description: data.message })
            }
        }
        catch (error) {
            errorToast({ error, description: 'Failed to upload background image' })
        }

        if (bgImage.value[activeCanvasSizeId.value]!.uploadKey) {
            await saveTemplates(() => {
                bgImage.value[activeCanvasSizeId.value]!.uploadKey = ''
                bgImage.value[activeCanvasSizeId.value]!.file = undefined
            })
        }
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
onMounted(() => {
    if (blockContainer.value.length > 0) {
        refreshGeneratedHtml()
    }
})

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
const selectedIdx = ref<number | null>(null)
const hoveredIdx = ref<number | null>(null)
const draggingCanvasBlock = ref<number | null>(null)
const draggingBlock = ref<string | null>(null)
const offset = ref<Coordinate>({ x: 0, y: 0 })
const tempPosition = ref<Coordinate>({ x: 0, y: 0 })

// SELECTION CHROME / MEASUREMENT
const SELECTION_BORDER_PX = 1.5
const HANDLE_SIZE_PX = 10
const FLOAT_BTN_GAP_PX = 8
const MIN_BLOCK_PX = 12
const MIN_FONT_PX = 6
const MAX_FONT_PX = 400
const FALLBACK_BOX_PX = 48

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
const CORNER_HANDLES: ResizeHandle[] = ['nw', 'ne', 'se', 'sw']
const ALL_HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

const iframeRef = ref<HTMLIFrameElement | null>(null)
// measured real size (canvas px) and computed font-size (px) per block index
const blockBounds = ref<Record<number, { w: number, h: number }>>({})
const blockFontPx = ref<Record<number, number>>({})

const resizing = ref<number | null>(null)
const resizeHandle = ref<ResizeHandle | null>(null)
const resizeStart = ref({ mx: 0, my: 0, w: 0, h: 0, cx: 0, cy: 0, fontPx: 16 })
const tempBounds = ref<{ w: number, h: number } | null>(null)
const tempCenter = ref<Coordinate | null>(null)
const tempFontPx = ref<number | null>(null)
let resizeFallbackTimer: ReturnType<typeof setTimeout> | undefined
// re-measures element bounds when iframe content settles (async images, reflow)
let iframeResizeObserver: ResizeObserver | undefined

function dragCanvasBlock(e: MouseEvent, idx: number, item: Block) {
    // drop any held post-resize preview so the box follows the drag immediately
    if (resizing.value !== null) clearResizeTemp()
    draggingCanvasBlock.value = idx
    selectedIdx.value = idx

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

    const newBlock: ElementBlock = {
        ...block,
        setting: cloneObject(block.setting),
        style: cloneObject(block.style),
        x: w,
        y: h,
        perBreakpoint: {},
    }
    props.canvasSizeOptions.forEach((c) => {
        const b: Block = {
            id: block.id,
            type: block.type,
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

    selectedIdx.value = blockContainer.value.length - 1
    draggingBlock.value = null
}

function startMoveCanvasBlock(e: MouseEvent) {
    if (draggingCanvasBlock.value === null) return

    const newXPx = (e.clientX - offset.value.x) / canvasScale.value
    const newYPx = (e.clientY - offset.value.y) / canvasScale.value

    const maxXPercent = Math.max(0, ((canvasWidth.value - DRAG_X_LIMIT) / canvasWidth.value) * 100)
    const maxYPercent = Math.max(0, ((canvasHeight.value - DRAG_Y_LIMIT) / canvasHeight.value) * 100)

    const newX = Math.max(0, Math.min(pxToPercent(newXPx, canvasWidth.value), maxXPercent))
    const newY = Math.max(0, Math.min(pxToPercent(newYPx, canvasHeight.value), maxYPercent))

    tempPosition.value = { x: newX, y: newY }
}

function stopMoveCanvasBlock() {
    if (draggingCanvasBlock.value === null) return

    const block = blockContainer.value.find((_, i) => i === draggingCanvasBlock.value)
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
    blockContainer.value.find((_, i) => i === selectedIdx.value),
)
const itemPosition = computed(() => (idx: number, block: Block) => {
    if (draggingCanvasBlock.value === idx) return tempPosition.value
    return { x: block.x, y: block.y }
})

onMounted(() => {
    props.staticBlocks.forEach((b) => {
        const block = cloneObject(b)
        block.perBreakpoint = {}
        props.canvasSizeOptions.forEach((c) => {
            block.perBreakpoint![c.id] = {
                id: b.id,
                type: b.type,
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
        const idx = blockContainer.value.findIndex(i => i.id === id)
        blockContainer.value.splice(idx, 1)
        if (selectedIdx.value === idx) selectedIdx.value = null
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
        selectedIdx.value = blockContainer.value.length - 1
    }
}

function duplicateBlock(block: ElementBlock) {
    const newBlock: ElementBlock = {
        ...block,
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
    selectedIdx.value = blockContainer.value.length - 1
}

function removeBlock(idx: number) {
    selectedIdx.value = null
    blockContainer.value.splice(idx, 1)
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
                dataItem = selectedItem.value.perBreakpoint[activeCanvasSizeId.value]!.setting.find(s => s.key === key)
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

// SELECTION CHROME HELPERS
function isTextBlock(type: string) {
    return type === BLOCK_TEXT_TYPE || type === BLOCK_DYNAMIC_TEXT_TYPE
}
function isImageBlock(type: string) {
    return type === BLOCK_IMAGE_TYPE
}
function isQrBlock(type: string) {
    return type === BLOCK_DYNAMIC_QR_IMAGE_TYPE
}
function handlesFor(block: Block): ResizeHandle[] {
    if (isImageBlock(block.type) || isQrBlock(block.type)) return ALL_HANDLES
    if (isTextBlock(block.type)) return CORNER_HANDLES
    return []
}
function cursorFor(dir: ResizeHandle) {
    if (dir === 'nw' || dir === 'se') return 'nwse-resize'
    if (dir === 'ne' || dir === 'sw') return 'nesw-resize'
    if (dir === 'n' || dir === 's') return 'ns-resize'
    return 'ew-resize'
}
function handleOffset(dir: ResizeHandle): Record<string, string> {
    const half = `${-HANDLE_SIZE_PX / 2}px`
    const mid = `calc(50% - ${HANDLE_SIZE_PX / 2}px)`
    const map: Record<ResizeHandle, Record<string, string>> = {
        nw: { left: half, top: half },
        n: { left: mid, top: half },
        ne: { right: half, top: half },
        e: { right: half, top: mid },
        se: { right: half, bottom: half },
        s: { left: mid, bottom: half },
        sw: { left: half, bottom: half },
        w: { left: half, top: mid },
    }
    return map[dir]
}

// Measure each rendered element's real size from inside the iframe (scale-agnostic:
// normalize by the rendered .page/.container rect so it works for both the
// internally-scaled getBackendRenderHtml layout and the plain getCheckInPageHtml one).
function measureBlocks() {
    if (!import.meta.client) return
    const doc = iframeRef.value?.contentDocument
    if (!doc) return
    const pageEl = doc.querySelector('.page, .container') as HTMLElement | null
    const pageRect = pageEl?.getBoundingClientRect()
    const sx = pageRect && canvasWidth.value ? pageRect.width / canvasWidth.value : 1
    const sy = pageRect && canvasHeight.value ? pageRect.height / canvasHeight.value : 1
    const bounds: Record<number, { w: number, h: number }> = {}
    const fonts: Record<number, number> = {}
    doc.querySelectorAll('[data-block-idx]').forEach((el) => {
        const idx = Number((el as HTMLElement).dataset.blockIdx)
        if (Number.isNaN(idx)) return
        const r = (el as HTMLElement).getBoundingClientRect()
        bounds[idx] = { w: r.width / (sx || 1), h: r.height / (sy || 1) }
        const textEl = (el.querySelector('p') as HTMLElement | null) ?? (el as HTMLElement)
        fonts[idx] = Number.parseFloat(getComputedStyle(textEl).fontSize) || 16
    })
    blockBounds.value = bounds
    blockFontPx.value = fonts
}

function clearResizeTemp() {
    resizing.value = null
    resizeHandle.value = null
    tempBounds.value = null
    tempCenter.value = null
    tempFontPx.value = null
    if (resizeFallbackTimer) {
        clearTimeout(resizeFallbackTimer)
        resizeFallbackTimer = undefined
    }
}

function observeIframeBlocks() {
    iframeResizeObserver?.disconnect()
    iframeResizeObserver = undefined
    const doc = iframeRef.value?.contentDocument
    const win = iframeRef.value?.contentWindow as (Window & typeof globalThis) | null
    const RO = win?.ResizeObserver
    if (!doc || !RO) return
    // re-measure whenever an element's box settles (async image load, font swap, reflow)
    iframeResizeObserver = new RO(() => requestAnimationFrame(() => measureBlocks()))
    doc.querySelectorAll('[data-block-idx]').forEach(el => iframeResizeObserver!.observe(el))
}

function onIframeLoad() {
    requestAnimationFrame(() => {
        measureBlocks()
        const doc = iframeRef.value?.contentDocument
        const fontSet = doc?.fonts as FontFaceSet | undefined
        if (fontSet?.ready) fontSet.ready.then(() => measureBlocks()).catch(() => {})
        // late <img> decode safety net
        setTimeout(() => measureBlocks(), 150)
        // keep bounds in sync as content settles (e.g. the external QR image loading)
        observeIframeBlocks()
        // fresh measurements available -> drop any held resize preview
        clearResizeTemp()
    })
}

function effectiveBounds(idx: number) {
    if (resizing.value === idx && tempBounds.value) return tempBounds.value
    return blockBounds.value[idx] ?? null
}

// Selection box in SCREEN px (overlay is NOT transform-scaled, so chrome stays constant-size).
function chromeBox(idx: number, bpBlock: Block) {
    const pos = (resizing.value === idx && tempCenter.value)
        ? tempCenter.value
        : itemPosition.value(idx, bpBlock)
    const scale = canvasScale.value
    const cxScreen = percentToPx(pos.x, canvasWidth.value) * scale
    const cyScreen = percentToPx(pos.y, canvasHeight.value) * scale
    const b = effectiveBounds(idx)
    let w = (b?.w ?? 0) * scale
    let h = (b?.h ?? 0) * scale
    if (!b || (w === 0 && h === 0)) {
        w = FALLBACK_BOX_PX
        h = FALLBACK_BOX_PX
    }
    return { left: cxScreen - w / 2, top: cyScreen - h / 2, w, h }
}
function chromeBoxStyle(idx: number, bpBlock: Block): Record<string, string | number> {
    const box = chromeBox(idx, bpBlock)
    return {
        left: `${box.left}px`,
        top: `${box.top}px`,
        width: `${box.w}px`,
        height: `${box.h}px`,
        zIndex: selectedIdx.value === idx ? 30 : hoveredIdx.value === idx ? 20 : 10,
    }
}
function floatBarStyle(idx: number, bpBlock: Block): Record<string, string> {
    const box = chromeBox(idx, bpBlock)
    const flipBelow = box.top < 32
    return {
        position: 'absolute',
        left: '100%',
        top: flipBelow ? '100%' : `${-FLOAT_BTN_GAP_PX}px`,
        transform: flipBelow ? `translate(-100%, ${FLOAT_BTN_GAP_PX}px)` : 'translate(-100%, -100%)',
        pointerEvents: 'auto',
    }
}

// RESIZE (opposite-edge-fixed; commit on release, mirroring the drag pattern)
function startResize(e: MouseEvent, idx: number, dir: ResizeHandle) {
    const block = blockContainer.value[idx]
    const bp = block?.perBreakpoint?.[activeCanvasSizeId.value]
    const b = blockBounds.value[idx]
    if (!bp || !b) return

    selectedIdx.value = idx
    resizing.value = idx
    resizeHandle.value = dir
    resizeStart.value = {
        mx: e.clientX,
        my: e.clientY,
        w: b.w,
        h: b.h,
        cx: percentToPx(bp.x, canvasWidth.value),
        cy: percentToPx(bp.y, canvasHeight.value),
        fontPx: blockFontPx.value[idx] ?? 16,
    }
    tempBounds.value = { w: b.w, h: b.h }
    tempCenter.value = { x: bp.x, y: bp.y }
    tempFontPx.value = resizeStart.value.fontPx

    window.addEventListener(EVENT_MOUSEMOVE, onResizeMove)
    window.addEventListener(EVENT_MOUSEUP, onResizeUp)
}

function onResizeMove(e: MouseEvent) {
    if (resizing.value === null || !resizeHandle.value) return
    const block = blockContainer.value[resizing.value]
    if (!block) return
    const dir = resizeHandle.value
    const s = resizeStart.value
    const dx = (e.clientX - s.mx) / canvasScale.value
    const dy = (e.clientY - s.my) / canvasScale.value

    const signX = dir.includes('e') ? 1 : dir.includes('w') ? -1 : 0
    const signY = dir.includes('s') ? 1 : dir.includes('n') ? -1 : 0
    const isCorner = signX !== 0 && signY !== 0

    let newW = s.w
    let newH = s.h
    let newFontPx = s.fontPx

    if (isTextBlock(block.type)) {
        // corners only -> scale font-size along the box diagonal
        const diag = Math.hypot(s.w, s.h) || 1
        const proj = (signX * dx * s.w + signY * dy * s.h) / diag
        let scale = (diag + proj) / diag
        newFontPx = Math.min(MAX_FONT_PX, Math.max(MIN_FONT_PX, s.fontPx * scale))
        scale = newFontPx / s.fontPx
        newW = s.w * scale
        newH = s.h * scale
    }
    else if (isCorner) {
        // image/qr corner -> lock aspect along the diagonal
        const diag = Math.hypot(s.w, s.h) || 1
        const proj = (signX * dx * s.w + signY * dy * s.h) / diag
        const scale = Math.max((diag + proj) / diag, MIN_BLOCK_PX / s.w, MIN_BLOCK_PX / s.h)
        newW = s.w * scale
        newH = s.h * scale
    }
    else {
        // image/qr edge -> single axis
        newW = Math.max(MIN_BLOCK_PX, s.w + signX * dx)
        newH = Math.max(MIN_BLOCK_PX, s.h + signY * dy)
    }

    const dcx = signX * (newW - s.w) / 2
    const dcy = signY * (newH - s.h) / 2
    tempBounds.value = { w: newW, h: newH }
    tempFontPx.value = newFontPx
    tempCenter.value = {
        x: pxToPercent(s.cx + dcx, canvasWidth.value),
        y: pxToPercent(s.cy + dcy, canvasHeight.value),
    }
}

function onResizeUp() {
    window.removeEventListener(EVENT_MOUSEMOVE, onResizeMove)
    window.removeEventListener(EVENT_MOUSEUP, onResizeUp)
    if (resizing.value === null) return

    const idx = resizing.value
    const block = blockContainer.value[idx]
    const bp = block?.perBreakpoint?.[activeCanvasSizeId.value]
    if (!block || !bp || !tempBounds.value || !tempCenter.value) {
        clearResizeTemp()
        return
    }
    selectedIdx.value = idx

    if (isTextBlock(block.type)) {
        const current = String(getBlockStyleValue(bp.style, BLOCK_STYLE_FONT_SIZE) || '')
        const useRem = current.trim().endsWith('rem')
        const px = tempFontPx.value ?? resizeStart.value.fontPx
        updateBlock('style', BLOCK_STYLE_FONT_SIZE, useRem ? `${Number((px / 16).toFixed(3))}rem` : `${Math.round(px)}px`)
    }
    else if (isImageBlock(block.type)) {
        updateBlock('style', BLOCK_STYLE_WIDTH, `${Math.round(tempBounds.value.w)}px`)
        updateBlock('style', BLOCK_STYLE_HEIGHT, `${Math.round(tempBounds.value.h)}px`)
    }
    else if (isQrBlock(block.type)) {
        updateBlock('setting', BLOCK_SETTING_WIDTH, `${Math.round(tempBounds.value.w)}px`)
        updateBlock('setting', BLOCK_SETTING_HEIGHT, `${Math.round(tempBounds.value.h)}px`)
    }

    updateBlock('position', 'x', Number(tempCenter.value.x.toFixed(2)))
    updateBlock('position', 'y', Number(tempCenter.value.y.toFixed(2)))

    // keep the preview box until the iframe reloads & re-measures (avoids snap-back);
    // fallback clear in case the commit produced no measurable change.
    resizeHandle.value = null
    if (resizeFallbackTimer) clearTimeout(resizeFallbackTimer)
    resizeFallbackTimer = setTimeout(() => clearResizeTemp(), 800)
}

onBeforeUnmount(() => {
    window.removeEventListener(EVENT_MOUSEMOVE, onResizeMove)
    window.removeEventListener(EVENT_MOUSEUP, onResizeUp)
    if (resizeFallbackTimer) clearTimeout(resizeFallbackTimer)
    iframeResizeObserver?.disconnect()
})

// HTML GENERATION
const generatedHtml = ref('')
const loadingPreview = ref(false)
let previewTimeout: ReturnType<typeof setTimeout>

function renderBlock(block: Block, value: string | boolean | number, idx?: number) {
    if (!block) return ''
    const absoluteStyle = getPositionStyle(block)
    return `
    <div style="${absoluteStyle}"${idx !== undefined ? ` data-block-idx="${idx}"` : ''}>
        ${renderPreviewHtml(block, value, compilePreviewStyle(block))}
    </div>
    `
}

function getrenderPreviewHtml(
    bgImage: BackgroundImage,
    width: number,
    height: number,
    content: string,
    staticContent: string,
    fontFaces: string,
) {
    if (!props.htmlPreviewFn) return getFallbackPreviewHtml(bgImage, width, height, content, staticContent, fontFaces)
    return props.htmlPreviewFn(bgImage, width, height, content, staticContent, fontFaces)
}

function refreshGeneratedHtml() {
    const usedFonts: string[] = []

    const customParts: string[] = []
    for (let i = 0; i < blockContainer.value.length; i++) {
        const block = blockContainer.value[i]
        if (!block || !block.perBreakpoint || !block.perBreakpoint[activeCanvasSizeId.value]) {
            customParts.push('')
            continue
        }
        const bpBlock = block.perBreakpoint[activeCanvasSizeId.value]!
        const blockFonts = getBlockStyleValue(bpBlock.style, BLOCK_STYLE_FONT_FAMILY)
        if (blockFonts && typeof blockFonts === 'string') {
            usedFonts.push(...blockFonts.split(',').map(v => v.trim()))
        }
        customParts.push(renderBlock(bpBlock, getBlockValue(block), i))
    }
    const customContent = customParts.join('\n')

    const staticParts: string[] = []
    for (const id of activeStaticBlocks.value) {
        const block = findStaticBlock(id)
        if (!block || !block.perBreakpoint || !block.perBreakpoint[activeCanvasSizeId.value]) {
            staticParts.push('')
            continue
        }
        const bpBlock = block.perBreakpoint[activeCanvasSizeId.value]!
        const blockFonts = getBlockStyleValue(bpBlock.style, BLOCK_STYLE_FONT_FAMILY)
        if (blockFonts && typeof blockFonts === 'string') {
            usedFonts.push(...blockFonts.split(',').map(v => v.trim()))
        }
        staticParts.push(renderBlock(bpBlock, block.value))
    }
    const staticContent = staticParts.join('\n')

    const bgImg = !bgImage.value || !bgImage.value[activeCanvasSizeId.value]
        ? { dataUrl: '' } as BackgroundImage
        : bgImage.value[activeCanvasSizeId.value]!

    const fontFaces = generateFontFaceRules(props.fontOptions, usedFonts)
    generatedHtml.value = getrenderPreviewHtml(
        bgImg,
        canvasWidth.value,
        canvasHeight.value,
        customContent,
        staticContent,
        fontFaces,
    )
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

// SAVE

function groupElementBlock(bp: Breakpoint): { customBlock: ElementBlock[], staticBlock: ElementBlock[] } {
    const blocks = blockContainer.value
    const customBlock: ElementBlock[] = []
    const staticBlock: ElementBlock[] = []

    for (let idx = 0; idx < props.staticBlocks.length; idx++) {
        const staticBlock = props.staticBlocks[idx]!
        if (!blocks.find(block => block.id === staticBlock.id)) {
            blocks.push(staticBlock)
        }
    }

    for (let idx = 0; idx < blocks.length; idx++) {
        const block = blocks[idx]!
        if (!block.perBreakpoint || !block.perBreakpoint[bp]) continue

        const bpBlock: Block = block.perBreakpoint[bp]!
        const b: ElementBlock = {
            ...block,
            uid: idx,
            elementId: bpBlock.elementId,
            style: cloneObject(bpBlock.style),
            setting: cloneObject(bpBlock.setting),
            x: bpBlock.x,
            y: bpBlock.y,
            perBreakpoint: undefined,
        }

        if (checkCustomBlock(block.id)) customBlock.push(b)
        if (checkStaticBlock(block.id)) staticBlock.push(b)
    }

    return { customBlock, staticBlock }
}

function makeVariants(preview?: boolean): TemplateVariant[] {
    return selectedCanvasSizes.value.map((size) => {
        const slug = size.id
        const { customBlock, staticBlock } = groupElementBlock(slug)

        return makeTemplateVariant(
            [...customBlock, ...staticBlock],
            size.id,
            preview ? bgImage.value?.[slug]?.dataUrl || '' : '',
            bgImage.value?.[slug]?.uploadKey || '',
            size.variantId,
            {
                width: `${props.canvasImageBased ? activeBgImage.value?.width || 0 : activeCanvasSize.value.width}px`,
                height: `${props.canvasImageBased ? activeBgImage.value?.height || 0 : activeCanvasSize.value.height}px`,
            },
        )
    })
}

async function saveTemplates(cb?: () => void) {
    if (!props.templateId) return

    try {
        loadingPreview.value = true
        const variants = makeVariants()
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/template/${props.templateId}`, {
            method: 'PUT',
            body: {
                variants,
            },
        })
        if (data.success) {
            successToast({ description: 'Key visual been saved' })
            emit(EMIT_EDITOR_REFRESH)
            if (cb !== undefined) {
                cb()
            }
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to save key visual' })
    }
    finally {
        loadingPreview.value = false
    }
}

// PREVIEW
function preview() {
    if (!import.meta.client || !props.previewPath) return
    if (!props.previewKey) return

    const variants = makeVariants(true)
    localStorage.setItem(props.previewKey, JSON.stringify(variants))
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
                    label="Save"
                    :disabled="loadingPreview"
                    @click="() => saveTemplates()"
                />
            </div>
        </div>

        <div class="grid grid-cols-7 h-[90vh] gap-4">
            <!-- LEFT: ElementBlock list + resizable HTML preview -->
            <div class="flex flex-col gap-4">
                <!-- CANVAS SETTINGS -->
                <UCard :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }">
                    <template #header>
                        <h5>Canvas Settings</h5>
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
                    :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }"
                >
                    <template #header>
                        <h5>Page Sizes</h5>
                    </template>
                    <div class="space-y-2">
                        <UFieldGroup
                            v-for="canvas in selectedCanvasSizes"
                            :key="`selcanvar-${canvas.id}`"
                        >
                            <UButton
                                class="cursor-pointer w-44"
                                variant="outline"
                                size="lg"
                                :color="activeCanvasSizeId === canvas.id ? 'primary' : 'neutral'"
                                :ui="{ base: 'justify-start!' }"
                                @click="toggleActiveCanvasSize(canvas.id)"
                            >
                                <UIcon
                                    :name="activeCanvasSizeId === canvas.id ? 'lucide:eye' : 'lucide:eye-off'"
                                    :class="`${activeCanvasSizeId === canvas.id && selectedCanvasSizes.length > 1 ? 'text-primary' : 'text-dimmed'}`"
                                />
                                {{ canvas.label }}
                            </UButton>
                            <UButton
                                icon="lucide:trash"
                                color="error"
                                @click="confirmRemoveCanvasSize(canvas.id)"
                            />
                        </UFieldGroup>
                        <UPopover v-model:open="selectCanvasSizePopover">
                            <UButton
                                icon="lucide:plus"
                                color="neutral"
                                variant="outline"
                                class="w-52"
                                :disabled="!unselectedCanvasSizes.length"
                            />

                            <template #content>
                                <div class="flex flex-col gap-2 p-2">
                                    <UButton
                                        v-for="canvas in unselectedCanvasSizes"
                                        :key="`unselcanvar-${canvas.id}`"
                                        class="cursor-pointer w-52"
                                        variant="outline"
                                        size="lg"
                                        color="neutral"
                                        :ui="{ base: 'justify-start!' }"
                                        @click="addCanvasSize(canvas.id)"
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
                    :body="`Are you sure want to delete variant ${removeCanvasSizesTarget}? All your changes will be deleted and can not restored.`"
                    @confirm="() => removeCanvasSize()"
                />

                <!-- BLOCKS -->
                <UCard :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }">
                    <template #header>
                        <h5>Blocks</h5>
                    </template>
                    <div class="space-y-2 overflow-y-scroll max-h-48">
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
                    :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }"
                >
                    <template #header>
                        <h5>Static Blocks</h5>
                    </template>
                    <div class="space-y-2 overflow-y-scroll max-h-48">
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
                <!-- <DevOnly> -->
                <!-- <UCard :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }"> -->
                <!--         <template #header> -->
                <!--             <h5>HTML Preview</h5> -->
                <!--         </template> -->
                <!---->
                <!--         <UTextarea -->
                <!--             v-model="generatedHtml" -->
                <!--             size="sm" -->
                <!--             class="rounded w-full font-mono py-1 px-2 resize-y" -->
                <!--             readonly -->
                <!--             :ui="{ base: 'scrollbar' }" -->
                <!--         /> -->
                <!--     </UCard> -->
                <!-- </DevOnly> -->
            </div>

            <!-- CENTER: Merged canvas (rendered preview + interactive layer) -->
            <div class="col-span-5 overflow-auto p-4 scrollbar">
                <div class="flex justify-center items-center min-h-full min-w-full">
                    <MiscLoadingOverlay :loading="loadingPreview">
                        <div
                            class="relative"
                            :style="{ width: `${canvasWidth * canvasScale}px`, height: `${canvasHeight * canvasScale}px`, overflow: 'visible' }"
                            @dragover="dragToCanvas"
                            @drop="dropCanvas"
                        >
                            <!-- (A) Clipped rendered design (kept in normal flow so the iframe
                                 positions against the outer wrapper, aligning with overlay B) -->
                            <EditorCanvasContainer
                                class="bg-neutral-100 dark:bg-neutral-900"
                                :width="`${canvasWidth * canvasScale}px`"
                                :height="`${canvasHeight * canvasScale}px`"
                            >
                                <iframe
                                    ref="iframeRef"
                                    class="absolute top-0 left-0"
                                    :style="{ ...canvasStyle, border: 'none', pointerEvents: 'none' }"
                                    :srcdoc="generatedHtml"
                                    @load="onIframeLoad"
                                />
                            </EditorCanvasContainer>

                            <!-- (B) Non-scaled selection chrome (constant size, overflow visible) -->
                            <div
                                class="absolute inset-0"
                                style="overflow: visible; pointer-events: none;"
                            >
                                <template
                                    v-for="block, bidx in blockContainer"
                                    :key="`${block.id}-${bidx}`"
                                >
                                    <div
                                        v-if="block.perBreakpoint && block.perBreakpoint[activeCanvasSizeId]"
                                        class="absolute"
                                        :style="chromeBoxStyle(bidx, block.perBreakpoint[activeCanvasSizeId]!)"
                                    >
                                        <!-- whole-element drag/select hit area -->
                                        <div
                                            class="absolute inset-0 cursor-move"
                                            style="pointer-events: auto;"
                                            @mouseenter="hoveredIdx = bidx"
                                            @mouseleave="hoveredIdx = null"
                                            @mousedown.prevent="dragCanvasBlock($event, bidx, block.perBreakpoint[activeCanvasSizeId]!)"
                                            @click.stop="selectedIdx = bidx"
                                        />

                                        <!-- selection / hover bounding box -->
                                        <div
                                            v-if="selectedIdx === bidx || hoveredIdx === bidx"
                                            class="absolute inset-0 rounded-[3px]"
                                            :style="{
                                                border: `${SELECTION_BORDER_PX}px solid ${selectedIdx === bidx ? 'rgba(59,130,246,0.9)' : 'rgba(59,130,246,0.45)'}`,
                                                boxShadow: selectedIdx === bidx ? '0 0 0 1px rgba(255,255,255,0.55)' : 'none',
                                                pointerEvents: 'none',
                                            }"
                                        />

                                        <!-- resize handles -->
                                        <template v-if="selectedIdx === bidx">
                                            <div
                                                v-for="dir in handlesFor(block.perBreakpoint[activeCanvasSizeId]!)"
                                                :key="dir"
                                                class="absolute rounded-[2px] shadow-sm"
                                                :style="{
                                                    width: `${HANDLE_SIZE_PX}px`,
                                                    height: `${HANDLE_SIZE_PX}px`,
                                                    background: '#ffffff',
                                                    border: '1px solid rgba(59,130,246,0.9)',
                                                    ...handleOffset(dir),
                                                    cursor: cursorFor(dir),
                                                    pointerEvents: 'auto',
                                                }"
                                                @mousedown.stop.prevent="startResize($event, bidx, dir)"
                                            />
                                        </template>

                                        <!-- floating Duplicate / Delete, outside the box (above top-right) -->
                                        <div
                                            v-if="selectedIdx === bidx && checkCustomBlock(block.id)"
                                            class="flex gap-1"
                                            :style="floatBarStyle(bidx, block.perBreakpoint[activeCanvasSizeId]!)"
                                        >
                                            <UButton
                                                size="xs"
                                                color="neutral"
                                                variant="solid"
                                                icon="lucide:copy"
                                                @click.stop="duplicateBlock(block)"
                                            />
                                            <UButton
                                                size="xs"
                                                color="error"
                                                variant="solid"
                                                icon="lucide:trash-2"
                                                @click.stop="removeBlock(bidx)"
                                            />
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </MiscLoadingOverlay>
                </div>
            </div>

            <!-- RIGHT: Page settings and settings -->
            <div class="flex flex-col gap-4">
                <!-- PAGE SETTINGS -->
                <UCard :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }">
                    <template #header>
                        <div class="flex items-center justify-between gap-2">
                            <h5>Page Settings</h5>
                        </div>
                    </template>

                    <div class="mb-4">
                        <h4 class="text-sm font-medium mb-2">
                            Background Image (Max 2MB)
                        </h4>

                        <template v-if="bgImage && bgImage[activeCanvasSizeId]">
                            <UFileUpload
                                v-slot="{ open, removeFile }"
                                v-model="bgImage[activeCanvasSizeId]!.file"
                                accept="image/*"
                            >
                                <UFieldGroup>
                                    <UInput
                                        readonly
                                        :model-value="bgImage[activeCanvasSizeId]!.name || 'Choose Image'"
                                        :ui="{ base: 'cursor-pointer' }"
                                        @click="open()"
                                    />
                                    <UButton
                                        :disabled="!Boolean(bgImage[activeCanvasSizeId]!.file) && !Boolean(bgImage[activeCanvasSizeId]!.dataUrl)"
                                        icon="lucide:trash"
                                        :color="!Boolean(bgImage[activeCanvasSizeId]!.file) && !Boolean(bgImage[activeCanvasSizeId]!.dataUrl) ? 'neutral' : 'error'"
                                        @click="clearImage(removeFile)"
                                    />
                                </UFieldGroup>

                                <p
                                    v-if="bgImage[activeCanvasSizeId]!.file"
                                    class="text-sm text-muted mt-2"
                                >
                                    width: {{ bgImage[activeCanvasSizeId]!.width }}
                                    height: {{ bgImage[activeCanvasSizeId]!.height }}
                                </p>
                            </UFileUpload>
                        </template>
                    </div>
                </UCard>

                <template v-if="selectedItem">
                    <!-- SETTINGS -->
                    <UCard
                        v-if="
                            selectedItem.withValue
                                || (selectedItem.perBreakpoint
                                    && selectedItem.perBreakpoint[activeCanvasSizeId]
                                    && selectedItem.perBreakpoint[activeCanvasSizeId]!.setting.filter(e => !e.hidden).length
                                )"
                        :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }"
                    >
                        <template #header>
                            <h5>Block Settings</h5>
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
                            v-if="selectedItem.perBreakpoint && selectedItem.perBreakpoint[activeCanvasSizeId]"
                            class="mb-4"
                        >
                            <template
                                v-for="setting in selectedItem.perBreakpoint[activeCanvasSizeId]!.setting"
                                :key="setting.key"
                            >
                                <EditorDynamicInput
                                    v-if="!setting.hidden"
                                    class="mb-4"
                                    :field="setting"
                                    @update="(e) => updateBlock('setting', setting.key, e)"
                                />
                            </template>
                        </div>
                    </UCard>

                    <!-- STYLE -->
                    <UCard :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }">
                        <template #header>
                            <h5>Block Styles</h5>
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
                                :font-options="fontOptions"
                                @update="(e) => selectedItem && updateBlock('style', style.key, e)"
                            />
                        </template>
                    </UCard>
                </template>
            </div>
        </div>
    </div>
</template>
