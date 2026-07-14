<script setup lang="ts">
/**
 * The DOM canvas. Renders the background + all blocks for the active breakpoint
 * and owns every pointer gesture (drag, resize, rotate, marquee-select, drop)
 * because it has the sibling geometry needed for snapping and group moves.
 * Geometry is computed in unscaled "canvas px"; client coords are converted by
 * dividing out the zoom from the scaled canvas' bounding rect.
 */
type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
interface Guide { axis: 'v' | 'h', pos: number }

const SNAP_THRESHOLD_PX = 6
const MIN_BOX_PX = 12

const ctx = useEditorV2Context()
const { snap } = useEditorSnapping()

const canvasEl = ref<HTMLElement | null>(null)
const guides = ref<Guide[]>([])
const marquee = ref<{ x: number, y: number, w: number, h: number } | null>(null)

const cw = computed(() => ctx.canvasWidth.value)
const ch = computed(() => ctx.canvasHeight.value)
const scale = computed(() => ctx.canvasScale.value)
const bgUrl = computed(() => ctx.activeBgImage.value?.dataUrl || '')

type Mode = 'idle' | 'drag' | 'resize' | 'marquee'
let mode: Mode = 'idle'
// whether the pointer actually moved during the gesture (so a plain click that
// only (re)selects an element doesn't push a no-op history entry)
let moved = false

let dragData: null | {
    startX: number
    startY: number
    primary: number
    start: Map<number, { x: number, y: number }>
    primaryBox: { w: number, h: number }
} = null

let resizeData: null | {
    idx: number
    dir: ResizeHandle
    startW: number
    startH: number
    cx0: number
    cy0: number
    angle: number
    isText: boolean
} = null

let marqueeStart = { x: 0, y: 0 }

// ---- geometry helpers ----
function toCanvasPx(clientX: number, clientY: number) {
    const rect = canvasEl.value!.getBoundingClientRect()
    return { x: (clientX - rect.left) / scale.value, y: (clientY - rect.top) / scale.value }
}
function blockBoxPx(idx: number): { w: number, h: number } {
    const el = canvasEl.value?.querySelector<HTMLElement>(`[data-block-idx="${idx}"]`)
    if (!el) return { w: MIN_BOX_PX, h: MIN_BOX_PX }
    return { w: el.offsetWidth || MIN_BOX_PX, h: el.offsetHeight || MIN_BOX_PX }
}

function addListeners() {
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
}
function removeListeners() {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
}

// ---- DRAG ----
function onBodyDown(idx: number, e: PointerEvent) {
    e.preventDefault()
    if (e.shiftKey) {
        ctx.toggleSelection(idx)
        return
    }
    if (!ctx.isSelected(idx)) ctx.select(idx)

    const start = new Map<number, { x: number, y: number }>()
    for (const i of ctx.selectedIds.value) {
        const bp = ctx.bpOf(i)
        if (bp) start.set(i, { x: bp.x, y: bp.y })
    }
    dragData = { startX: e.clientX, startY: e.clientY, primary: idx, start, primaryBox: blockBoxPx(idx) }
    mode = 'drag'
    moved = false
    addListeners()
}

function onDragMove(e: PointerEvent) {
    if (!dragData) return
    const dxPct = pxToPercent((e.clientX - dragData.startX) / scale.value, cw.value)
    const dyPct = pxToPercent((e.clientY - dragData.startY) / scale.value, ch.value)
    const startPrimary = dragData.start.get(dragData.primary)!
    const rawX = startPrimary.x + dxPct
    const rawY = startPrimary.y + dyPct

    const movingBox = {
        cx: percentToPx(rawX, cw.value),
        cy: percentToPx(rawY, ch.value),
        w: dragData.primaryBox.w,
        h: dragData.primaryBox.h,
    }
    const others: { cx: number, cy: number, w: number, h: number }[] = []
    ctx.blockContainer.value.forEach((b, i) => {
        if (dragData!.start.has(i)) return
        const bp = b.perBreakpoint?.[ctx.activeCanvasSizeId.value]
        if (!bp) return
        const box = blockBoxPx(i)
        others.push({ cx: percentToPx(bp.x, cw.value), cy: percentToPx(bp.y, ch.value), w: box.w, h: box.h })
    })

    const res = snap(movingBox, others, { w: cw.value, h: ch.value }, SNAP_THRESHOLD_PX / scale.value)
    const effDx = pxToPercent(res.cx, cw.value) - startPrimary.x
    const effDy = pxToPercent(res.cy, ch.value) - startPrimary.y
    for (const [i, p] of dragData.start) ctx.setPosition(i, p.x + effDx, p.y + effDy)
    guides.value = res.guides
}

// ---- RESIZE ----
function onResizeDown(idx: number, dir: ResizeHandle, e: PointerEvent) {
    e.preventDefault()
    ctx.select(idx)
    const bp = ctx.bpOf(idx)
    if (!bp) return
    const box = blockBoxPx(idx)
    resizeData = {
        idx,
        dir,
        startW: box.w,
        startH: box.h,
        cx0: percentToPx(bp.x, cw.value),
        cy0: percentToPx(bp.y, ch.value),
        angle: ((bp.rotate || 0) * Math.PI) / 180,
        isText: bp.type === BLOCK_TEXT_TYPE || bp.type === BLOCK_DYNAMIC_TEXT_TYPE,
    }
    mode = 'resize'
    moved = false
    addListeners()
}

function onResizeMove(e: PointerEvent) {
    if (!resizeData) return
    const { idx, dir, startW, startH, cx0, cy0, angle, isText } = resizeData
    const p = toCanvasPx(e.clientX, e.clientY)
    const ux = { x: Math.cos(angle), y: Math.sin(angle) }
    const uy = { x: -Math.sin(angle), y: Math.cos(angle) }
    const sx = dir.includes('e') ? 1 : dir.includes('w') ? -1 : 0
    const sy = dir.includes('s') ? 1 : dir.includes('n') ? -1 : 0

    const anchor = {
        x: cx0 + ux.x * (-sx * startW / 2) + uy.x * (-sy * startH / 2),
        y: cy0 + ux.y * (-sx * startW / 2) + uy.y * (-sy * startH / 2),
    }
    const v = { x: p.x - anchor.x, y: p.y - anchor.y }
    const lx = v.x * ux.x + v.y * ux.y
    const ly = v.x * uy.x + v.y * uy.y

    let newW = sx !== 0 ? Math.max(MIN_BOX_PX, sx * lx) : startW
    let newH = sy !== 0 ? Math.max(MIN_BOX_PX, sy * ly) : startH
    const corner = sx !== 0 && sy !== 0
    const s = Math.max(newW / startW, newH / startH)
    // images keep their aspect ratio on corner drags; text areas resize freely on
    // every handle so users can shape the box (width and height independently).
    if (!isText && corner) {
        newW = startW * s
        newH = startH * s
    }

    const cxN = cx0 + ux.x * (sx * (newW - startW) / 2) + uy.x * (sy * (newH - startH) / 2)
    const cyN = cy0 + ux.y * (sx * (newW - startW) / 2) + uy.y * (sy * (newH - startH) / 2)
    ctx.setPosition(idx, pxToPercent(cxN, cw.value), pxToPercent(cyN, ch.value))

    // both text areas and images resize the box; text font-size is set only via
    // the inspector now, no longer by dragging.
    ctx.setBoxSizePx(idx, newW, newH)
}

// ---- MARQUEE ----
function onCanvasDown(e: PointerEvent) {
    if ((e.target as HTMLElement).closest('[data-block-idx]')) return
    if (!e.shiftKey) ctx.clearSelection()
    const p = toCanvasPx(e.clientX, e.clientY)
    marqueeStart = p
    marquee.value = { x: p.x, y: p.y, w: 0, h: 0 }
    mode = 'marquee'
    addListeners()
}

function onMarqueeMove(e: PointerEvent) {
    const p = toCanvasPx(e.clientX, e.clientY)
    marquee.value = {
        x: Math.min(p.x, marqueeStart.x),
        y: Math.min(p.y, marqueeStart.y),
        w: Math.abs(p.x - marqueeStart.x),
        h: Math.abs(p.y - marqueeStart.y),
    }
}

function commitMarquee() {
    const r = marquee.value
    if (r && (r.w > 2 || r.h > 2)) {
        const sel: number[] = []
        ctx.blockContainer.value.forEach((b, i) => {
            const bp = b.perBreakpoint?.[ctx.activeCanvasSizeId.value]
            if (!bp) return
            const cxp = percentToPx(bp.x, cw.value)
            const cyp = percentToPx(bp.y, ch.value)
            if (cxp >= r.x && cxp <= r.x + r.w && cyp >= r.y && cyp <= r.y + r.h) sel.push(i)
        })
        if (sel.length) ctx.selectMany(sel)
    }
    marquee.value = null
}

// ---- dispatch ----
function onPointerMove(e: PointerEvent) {
    moved = true
    if (mode === 'drag') onDragMove(e)
    else if (mode === 'resize') onResizeMove(e)
    else if (mode === 'marquee') onMarqueeMove(e)
}
function onPointerUp() {
    const wasInteractive = mode === 'drag' || mode === 'resize'
    if (mode === 'marquee') commitMarquee()
    guides.value = []
    dragData = null
    resizeData = null
    // only snapshot history when the gesture actually changed something
    if (wasInteractive && moved) ctx.commit()
    mode = 'idle'
    removeListeners()
}

// ---- drop new block from the left panel ----
function onDragOver(e: DragEvent) {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
}
function onDrop(e: DragEvent) {
    e.preventDefault()
    const blockId = e.dataTransfer?.getData('text/plain')
    if (!blockId || !canvasEl.value) return
    const p = toCanvasPx(e.clientX, e.clientY)
    ctx.addBlockAt(blockId, pxToPercent(p.x, cw.value), pxToPercent(p.y, ch.value))
}

onBeforeUnmount(removeListeners)
</script>

<template>
    <div
        class="relative"
        :style="{ width: `${cw * scale}px`, height: `${ch * scale}px`, overflow: 'visible' }"
        @dragover="onDragOver"
        @drop="onDrop"
    >
        <div
            ref="canvasEl"
            data-editor-canvas
            class="absolute top-0 left-0 bg-neutral-100 dark:bg-neutral-900 shadow-sm"
            :style="{ width: `${cw}px`, height: `${ch}px`, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'visible' }"
            @pointerdown="onCanvasDown"
        >
            <!-- background (clipped to canvas) -->
            <div
                class="absolute inset-0 overflow-hidden"
            >
                <template v-if="bgUrl">
                    <div
                        class="absolute inset-0"
                        :style="{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(40px) brightness(0.75)', transform: 'scale(1.1)' }"
                    />
                    <div
                        class="absolute inset-0"
                        :style="{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }"
                    />
                </template>
            </div>

            <!-- blocks -->
            <EditorV2Element
                v-for="(block, idx) in ctx.blockContainer.value"
                :key="`${block.id}-${idx}`"
                :idx="idx"
                @bodydown="onBodyDown"
                @resizedown="onResizeDown"
            />

            <!-- alignment guides -->
            <div
                v-for="(g, gi) in guides"
                :key="`guide-${gi}`"
                class="absolute bg-pink-500 pointer-events-none"
                :style="g.axis === 'v'
                    ? { left: `${g.pos}px`, top: '0px', width: `${1 / scale}px`, height: `${ch}px` }
                    : { top: `${g.pos}px`, left: '0px', height: `${1 / scale}px`, width: `${cw}px` }"
            />

            <!-- marquee selection -->
            <div
                v-if="marquee"
                class="absolute pointer-events-none"
                :style="{
                    left: `${marquee.x}px`,
                    top: `${marquee.y}px`,
                    width: `${marquee.w}px`,
                    height: `${marquee.h}px`,
                    border: `${1 / scale}px dashed rgba(59,130,246,0.9)`,
                    background: 'rgba(59,130,246,0.08)',
                }"
            />
        </div>
    </div>
</template>
