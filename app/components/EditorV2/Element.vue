<script setup lang="ts">
/**
 * A single design block rendered as real DOM (Canva-style direct manipulation).
 * The inner content is produced by the SAME render helpers the current editor
 * uses, so visual output matches. Pointer math (drag/resize/rotate) lives in the
 * parent Canvas (it owns sibling geometry + snapping); this component only paints
 * the block + selection chrome and forwards low-level pointer intents.
 */
const props = defineProps<{ idx: number }>()

const emit = defineEmits<{
    bodydown: [idx: number, ev: PointerEvent]
    resizedown: [idx: number, dir: ResizeHandle, ev: PointerEvent]
    rotatedown: [idx: number, ev: PointerEvent]
}>()

const ctx = useEditorV2Context()

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
const CORNER_HANDLES: ResizeHandle[] = ['nw', 'ne', 'se', 'sw']
const ALL_HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
const HANDLE_PX = 10
const BORDER_PX = 1.5
const ROTATE_OFFSET_PX = 26

const block = computed(() => ctx.blockContainer.value[props.idx])
const bpBlock = computed(() => block.value?.perBreakpoint?.[ctx.activeCanvasSizeId.value])
const selected = computed(() => ctx.isSelected(props.idx))
const hovered = computed(() => ctx.hoveredId.value === props.idx)
const inv = computed(() => 1 / ctx.canvasScale.value)

const isText = computed(() => {
    const t = bpBlock.value?.type
    return t === BLOCK_TEXT_TYPE || t === BLOCK_DYNAMIC_TEXT_TYPE
})
const handles = computed<ResizeHandle[]>(() => {
    const t = bpBlock.value?.type
    if (t === BLOCK_IMAGE_TYPE || t === BLOCK_DYNAMIC_QR_IMAGE_TYPE) return ALL_HANDLES
    if (isText.value) return CORNER_HANDLES
    return []
})
const resizable = computed(() => handles.value.length > 0)

const innerHtml = computed(() => {
    const b = block.value
    const bp = bpBlock.value
    if (!b || !bp) return ''
    return renderPreviewHtml(bp, getBlockValue(b), compilePreviewStyle(bp))
})

const wrapperStyle = computed(() => {
    const bp = bpBlock.value
    if (!bp) return {}
    return {
        position: 'absolute' as const,
        left: `${bp.x}%`,
        top: `${bp.y}%`,
        transform: `translate(-50%, -50%) rotate(${bp.rotate || 0}deg)`,
        cursor: 'move',
        userSelect: 'none' as const,
        touchAction: 'none' as const,
    }
})

function cursorFor(dir: ResizeHandle) {
    if (dir === 'nw' || dir === 'se') return 'nwse-resize'
    if (dir === 'ne' || dir === 'sw') return 'nesw-resize'
    if (dir === 'n' || dir === 's') return 'ns-resize'
    return 'ew-resize'
}
function handleOffset(dir: ResizeHandle): Record<string, string> {
    const half = `${(-HANDLE_PX * inv.value) / 2}px`
    const mid = `calc(50% - ${(HANDLE_PX * inv.value) / 2}px)`
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
</script>

<template>
    <!-- eslint-disable vue/no-v-html -- HTML comes from our own trusted render helpers, same as the current editor's iframe srcdoc -->
    <div
        v-if="bpBlock"
        :data-block-idx="idx"
        :style="wrapperStyle"
        @pointerdown="emit('bodydown', idx, $event)"
        @pointerenter="ctx.hoveredId.value = idx"
        @pointerleave="ctx.hoveredId.value = null"
    >
        <!-- rendered block content (matches the current editor output). HTML comes
             from our own trusted render helpers, same as the current editor's iframe srcdoc. -->
        <div
            class="ev2-content"
            style="pointer-events: none;"
            v-html="innerHtml"
        />

        <!-- selection / hover bounding box -->
        <div
            v-if="selected || hovered"
            class="absolute inset-0 rounded-[3px]"
            :style="{
                border: `${BORDER_PX * inv}px solid ${selected ? 'rgba(59,130,246,0.9)' : 'rgba(59,130,246,0.45)'}`,
                boxShadow: selected ? `0 0 0 ${inv}px rgba(255,255,255,0.55)` : 'none',
                pointerEvents: 'none',
            }"
        />

        <!-- resize handles -->
        <template v-if="selected && resizable">
            <div
                v-for="dir in handles"
                :key="dir"
                class="absolute rounded-[2px] shadow-sm"
                :style="{
                    width: `${HANDLE_PX * inv}px`,
                    height: `${HANDLE_PX * inv}px`,
                    background: '#ffffff',
                    border: `${inv}px solid rgba(59,130,246,0.9)`,
                    ...handleOffset(dir),
                    cursor: cursorFor(dir),
                    pointerEvents: 'auto',
                }"
                @pointerdown.stop="emit('resizedown', idx, dir, $event)"
            />

            <!-- rotate handle -->
            <div
                class="absolute left-1/2 flex items-center justify-center rounded-full bg-white shadow"
                :style="{
                    width: `${HANDLE_PX * inv}px`,
                    height: `${HANDLE_PX * inv}px`,
                    top: `${-ROTATE_OFFSET_PX * inv}px`,
                    transform: 'translateX(-50%)',
                    border: `${inv}px solid rgba(59,130,246,0.9)`,
                    cursor: 'grab',
                    pointerEvents: 'auto',
                }"
                @pointerdown.stop="emit('rotatedown', idx, $event)"
            >
                <UIcon
                    name="lucide:rotate-cw"
                    :style="{ width: `${7 * inv}px`, height: `${7 * inv}px`, color: 'rgba(59,130,246,0.9)' }"
                />
            </div>
        </template>
    </div>
</template>
