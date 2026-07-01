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
}>()

const ctx = useEditorV2Context()

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
const CORNER_HANDLES: ResizeHandle[] = ['nw', 'ne', 'se', 'sw']
const ALL_HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
const HANDLE_PX = 10
const BORDER_PX = 1.5

const block = computed(() => ctx.blockContainer.value[props.idx])
const bpBlock = computed(() => block.value?.perBreakpoint?.[ctx.activeCanvasSizeId.value])
const selected = computed(() => ctx.isSelected(props.idx))
const hovered = computed(() => ctx.hoveredId.value === props.idx)
const inv = computed(() => 1 / ctx.canvasScale.value)

const isText = computed(() => {
    const t = bpBlock.value?.type
    return t === BLOCK_TEXT_TYPE || t === BLOCK_DYNAMIC_TEXT_TYPE
})
// Only the free-text block edits inline; dynamic text shows a backend-variable
// preview and must not be edited on the canvas.
const canInlineEdit = computed(() => bpBlock.value?.type === BLOCK_TEXT_TYPE)
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

// compiled text style (color/align/font-*) reused for the inline editor so it
// looks identical to the static render.
const editStyle = computed(() => (bpBlock.value ? compilePreviewStyle(bpBlock.value) : ''))

const wrapperStyle = computed(() => {
    const bp = bpBlock.value
    if (!bp) return {}
    return {
        position: 'absolute' as const,
        left: `${bp.x}%`,
        top: `${bp.y}%`,
        // intrinsic width so the absolutely-positioned box does NOT shrink-to-fit
        // against the shrinking space near the right edge (which would scale images
        // down / reflow text as the element moves). Must be max-content, not
        // fit-content (fit-content still clamps to available space).
        width: 'max-content' as const,
        transform: 'translate(-50%, -50%)',
        cursor: editing.value ? 'text' : 'move',
        userSelect: 'none' as const,
        touchAction: 'none' as const,
    }
})

// ---- inline text editing (double-click) ----
const editing = ref(false)
const editEl = ref<HTMLElement | null>(null)
let editOriginal = ''

function onDblClick() {
    if (!canInlineEdit.value) return
    ctx.select(props.idx)
    editOriginal = block.value?.value ?? ''
    editing.value = true
    nextTick(() => {
        const el = editEl.value
        if (!el) return
        el.textContent = editOriginal
        el.focus()
        const range = document.createRange()
        range.selectNodeContents(el)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
    })
}

function finishEdit() {
    if (!editing.value) return
    const text = editEl.value?.innerText ?? ''
    editing.value = false
    // an empty box would render zero-width and become impossible to reselect;
    // treat empty as "no change" and keep the original text.
    const next = text.trim() === '' ? editOriginal : text
    if (next !== editOriginal) {
        ctx.setValue(props.idx, next)
        ctx.commit()
    }
}

function cancelEdit() {
    // discard: finishEdit early-returns once editing is false, so the trailing
    // blur won't commit anything.
    editing.value = false
}

function onEditKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        editEl.value?.blur()
    }
    else if (e.key === 'Escape') {
        e.preventDefault()
        cancelEdit()
    }
}

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
        @dblclick="onDblClick"
    >
        <!-- rendered block content (matches the current editor output). HTML comes
             from our own trusted render helpers, same as the current editor's iframe srcdoc. -->
        <div
            v-show="!editing"
            class="ev2-content"
            style="pointer-events: none;"
            v-html="innerHtml"
        />

        <!-- inline text editor (free text only): mirrors the static structure
             (styled container + <p>), seeded imperatively so reactivity never
             resets the caret. -->
        <div
            v-if="editing"
            class="ev2-content"
            :style="editStyle"
        >
            <p
                ref="editEl"
                contenteditable="plaintext-only"
                style="margin: 0; outline: none; cursor: text; user-select: text; white-space: pre-wrap; min-width: 4px;"
                @pointerdown.stop
                @dblclick.stop
                @keydown="onEditKeydown"
                @blur="finishEdit"
            />
        </div>

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
        <template v-if="selected && resizable && !editing">
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
        </template>
    </div>
</template>
