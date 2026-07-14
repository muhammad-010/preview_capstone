import type { InjectionKey } from 'vue'
import type { EditorV2Props } from '@@/shared/types/app'

/**
 * Central state + actions store for EditorV2 (the Canva-like editor).
 *
 * It mirrors the data model and the save/preview pipeline of the current editor
 * (app/components/Editor/Main.vue) so the backend API and on-disk template format
 * are reused unchanged — only the UI/UX differs. State is provided via
 * provide/inject so the panels/canvas stay thin.
 */
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const DUPLICATE_OFFSET = 5

function clampPct(n: number): number {
    return Math.max(0, Math.min(100, n))
}

function isTextType(type: string): boolean {
    return type === BLOCK_TEXT_TYPE || type === BLOCK_DYNAMIC_TEXT_TYPE
}

function isImageType(type: string): boolean {
    return type === BLOCK_IMAGE_TYPE
}

function isQrType(type: string): boolean {
    return type === BLOCK_DYNAMIC_QR_IMAGE_TYPE
}

export function isResizableType(type: string): boolean {
    return isTextType(type) || isImageType(type) || isQrType(type)
}

export function useEditorV2(props: EditorV2Props, emit: (event: typeof EMIT_EDITOR_REFRESH) => void) {
    const router = useRouter()
    const toast = useToast()
    const { $api } = useNuxtApp()
    const { successToast } = useSuccessToast()
    const { errorToast } = useErrorToast()

    // Canvas-size presets are hidden for now: image-based editors size the canvas
    // from the uploaded background image again. Flip EDITOR_CANVAS_SIZE_PRESETS_ENABLED
    // (block.constants.ts) to bring the picker back.
    const usePresetCanvas = props.canvasImageBased && EDITOR_CANVAS_SIZE_PRESETS_ENABLED

    // ---- CANVAS SIZE / VARIANTS ----
    const selectedCanvasSizeIds = ref<Breakpoint[]>([...props.defaultSelectedCanvasSizeIds])
    const activeCanvasSizeId = ref<Breakpoint>(props.defaultActiveCanvasSizeId)
    const activeCanvasSize = computed(() => props.canvasSizeOptions.find(c => c.id === activeCanvasSizeId.value)!)
    const selectedCanvasSizes = computed(() => selectedCanvasSizeIds.value.reduce<CanvasSize[]>((acc, id) => {
        const found = props.canvasSizeOptions.find(c => c.id === id)
        if (found) acc.push(found)
        return acc
    }, []))
    const unselectedCanvasSizes = computed(() => props.canvasSizeOptions.filter(c => !selectedCanvasSizeIds.value.includes(c.id)))

    function addCanvasSize(id: Breakpoint) {
        if (selectedCanvasSizeIds.value.includes(id)) return
        selectedCanvasSizeIds.value.push(id)
        activeCanvasSizeId.value = id
    }

    function removeCanvasSize(id: Breakpoint) {
        if (selectedCanvasSizeIds.value.length === 1) return
        const index = selectedCanvasSizeIds.value.indexOf(id)
        if (index === -1) return

        const candidate = index + 1 === selectedCanvasSizeIds.value.length
            ? selectedCanvasSizeIds.value[index - 1]
            : selectedCanvasSizeIds.value[index + 1]
        if (!candidate) return

        selectedCanvasSizeIds.value.splice(index, 1)
        if (activeCanvasSizeId.value === id) activeCanvasSizeId.value = candidate
    }

    function setActiveCanvasSize(id: Breakpoint) {
        if (!selectedCanvasSizeIds.value.includes(id)) return
        activeCanvasSizeId.value = id
        clearSelection()
    }

    // ---- CANVAS ORIENTATION / SCALE ----
    const canvasOrientation = ref<Orientation>(props.defaultOrientation)
    const canvasOrientationSelections = props.canvasImageBased
        ? [props.defaultOrientation]
        : [EDITOR_CANVAS_PORTRAIT, EDITOR_CANVAS_LANDSCAPE]
    function shouldFlipCanvas(co: Orientation, ao: Orientation) {
        return co !== ao
    }
    watch(activeCanvasSizeId, () => {
        canvasOrientation.value = activeCanvasSize.value.orientation
    })

    const canvasScalePercentage = ref(Math.round((props.defaultScale || EDITOR_CANVAS_SCALE) * 100))
    const canvasScale = computed(() => canvasScalePercentage.value / 100)

    function zoomBy(deltaPercent: number) {
        canvasScalePercentage.value = Math.max(10, Math.min(200, canvasScalePercentage.value + deltaPercent))
    }

    // Fit the canvas to the given available viewport (unscaled canvas px vs px):
    // scale so the whole canvas is visible, clamped to the zoom bounds. Returns
    // false when dimensions aren't measurable yet (so the caller can retry).
    function fitCanvasToViewport(availW: number, availH: number): boolean {
        const cw = canvasWidth.value
        const ch = canvasHeight.value
        if (cw <= 0 || ch <= 0 || availW <= 0 || availH <= 0) return false
        const pct = Math.floor(Math.min(availW / cw, availH / ch) * 100)
        canvasScalePercentage.value = Math.max(10, Math.min(200, pct))
        return true
    }

    // ---- BACKGROUND IMAGE ----
    const bgImage = ref<Partial<Record<Breakpoint, BackgroundImage>>>(cloneObject(props.defaultBackgroundImages))
    const activeBgImage = computed<BackgroundImage | undefined>(() => bgImage.value?.[activeCanvasSizeId.value])

    // Snapshot of the background loaded when the editor opened. Deep-cloned so it
    // stays fixed even as bgImage is mutated; also used to derive the backend origin.
    const initialBackgroundImages = cloneObject(props.defaultBackgroundImages)

    // Backend base URL isn't exposed to the client, but stored background URLs are
    // absolute (they contain the browser-reachable backend origin), so derive it
    // from whichever background the template loaded with.
    const backendOrigin = (() => {
        for (const bp of Object.keys(initialBackgroundImages) as Breakpoint[]) {
            const url = initialBackgroundImages[bp]?.dataUrl
            if (!url) continue
            try {
                return new URL(url).origin
            }
            catch {
                // relative/invalid URL — keep looking
            }
        }
        return ''
    })()

    // The factory default background URL (origin + the editor's default path).
    const defaultBackgroundUrl = computed(() =>
        props.defaultBackgroundPath && backendOrigin ? `${backendOrigin}${props.defaultBackgroundPath}` : '',
    )
    // Reset is only meaningful where a factory default exists (invitation /
    // certificate); check-in has no default path.
    const canResetBackground = computed(() => !!defaultBackgroundUrl.value)

    // Restore the active canvas's background to the backend factory default image.
    // The backend only changes a background via an upload_key, so re-upload the
    // default image (server-side, no CORS) to get a key, then save like a normal upload.
    async function resetBackground() {
        const url = defaultBackgroundUrl.value
        const path = props.defaultBackgroundPath
        if (!url || !path) return
        const bp = activeCanvasSizeId.value
        const cs = activeCanvasSize.value
        try {
            const res = await $api(`/api/editor/reset-background`, { method: 'POST', body: { path } })
            if (!res?.success) {
                errorToast({ description: res?.message || 'Failed to reset background' })
                return
            }
            bgImage.value[bp] = {
                dataUrl: url, // static default URL — used for the canvas preview
                uploadKey: res.data.upload_key, // attaches the default image on save
                width: cs?.width || 0,
                height: cs?.height || 0,
                name: path.split('/').pop(),
            }
            commit()
            await save()
        }
        catch (error) {
            errorToast({ error, description: 'Failed to reset background' })
        }
    }

    // A slot is still "default" when it has no image yet, or still points at a
    // backend default_* static image (invitation/certificate). The BE base URL
    // varies by environment, so match the static-image path suffix.
    const DEFAULT_BG_PATH = '/storage/file/static/image/default_'
    function isDefaultBg(slot?: BackgroundImage): boolean {
        if (!slot?.dataUrl) return true
        return slot.dataUrl.includes(DEFAULT_BG_PATH)
    }
    // image-based editors check the single active background; check-in is "default"
    // only when none of its device backgrounds have been set.
    const usingDefaultBackground = computed(() =>
        props.canvasImageBased
            ? isDefaultBg(activeBgImage.value)
            : selectedCanvasSizes.value.every(cs => isDefaultBg(bgImage.value[cs.id])),
    )

    async function uploadBackground(file: File) {
        const slot = bgImage.value?.[activeCanvasSizeId.value]
        if (!file || !slot) return
        if (file.size > MAX_FILE_SIZE) {
            toast.add({ title: 'Background Exceed Limit', description: 'Max file limit are 2MB', color: 'error' })
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const img = new Image()
            img.onload = () => {
                slot.width = img.width
                slot.height = img.height
                // when the preset picker is off, image-based editors follow the
                // uploaded image, so orient the canvas to it.
                if (!usePresetCanvas && props.canvasSizeOptions) {
                    canvasOrientation.value = img.width > img.height ? EDITOR_CANVAS_LANDSCAPE : EDITOR_CANVAS_PORTRAIT
                }
            }
            const src = reader.result as string
            img.src = src
            slot.dataUrl = src
        }
        slot.name = file.name
        reader.readAsDataURL(file)

        const body = new FormData()
        body.append('file', file)
        try {
            const data = await $api(`/api/upload/media`, { method: 'POST', body })
            if (data.success) {
                successToast({ description: 'Background image uploaded' })
                slot.uploadKey = data.data.upload_key
            }
            else {
                errorToast({ description: data.message })
            }
        }
        catch (error) {
            errorToast({ error, description: 'Failed to upload background image' })
        }

        if (slot.uploadKey) {
            await save(() => {
                slot.uploadKey = ''
            })
        }
        commit()
    }

    function clearBackground() {
        const slot = bgImage.value?.[activeCanvasSizeId.value]
        if (!slot) return
        slot.dataUrl = ''
        slot.uploadKey = ''
        slot.name = undefined
        slot.width = 0
        slot.height = 0
        commit()
    }

    // ---- CANVAS SIZE PRESETS (image-based editors: invitation / certificate) ----
    // Decoupled from the breakpoint slug: the chosen preset only drives the canvas
    // width/height and the saved variant `setting`. Init from the saved size so
    // existing designs open unchanged; new designs default to the page's declared size.
    const savedCanvasSize = props.defaultBackgroundImages[props.defaultActiveCanvasSizeId]
    const savedCanvasW = savedCanvasSize?.width || 0
    const savedCanvasH = savedCanvasSize?.height || 0

    function findPresetByDims(w: number, h: number) {
        return KEY_VISUAL_CANVAS_PRESETS.find(p => p.width === w && p.height === h)
    }

    // synthetic preset preserving a saved size that matches no named preset
    const customCanvasPreset = ref<CanvasSizePreset | null>(null)
    const initialPresetKey = (() => {
        if (savedCanvasW > 0 && savedCanvasH > 0) {
            const match = findPresetByDims(savedCanvasW, savedCanvasH)
            if (match) return match.key
            customCanvasPreset.value = {
                key: 'current',
                label: `Current (${savedCanvasW}×${savedCanvasH})`,
                width: savedCanvasW,
                height: savedCanvasH,
                orientation: savedCanvasW > savedCanvasH ? EDITOR_CANVAS_LANDSCAPE : EDITOR_CANVAS_PORTRAIT,
            }
            return 'current'
        }
        const declared = props.canvasSizeOptions[0]
        const declaredMatch = declared && findPresetByDims(declared.width, declared.height)
        if (declaredMatch) return declaredMatch.key
        const byOrientation = KEY_VISUAL_CANVAS_PRESETS.find(p => p.orientation === props.defaultOrientation)
        return (byOrientation || KEY_VISUAL_CANVAS_PRESETS[0]!).key
    })()

    const canvasPresetKey = ref<string>(initialPresetKey)
    const canvasPresets = computed<CanvasSizePreset[]>(() =>
        customCanvasPreset.value ? [customCanvasPreset.value, ...KEY_VISUAL_CANVAS_PRESETS] : KEY_VISUAL_CANVAS_PRESETS,
    )
    const activeCanvasPreset = computed<CanvasSizePreset>(() =>
        canvasPresets.value.find(p => p.key === canvasPresetKey.value) || KEY_VISUAL_CANVAS_PRESETS[0]!,
    )
    const portraitPresets = computed(() => canvasPresets.value.filter(p => p.orientation === EDITOR_CANVAS_PORTRAIT))
    const landscapePresets = computed(() => canvasPresets.value.filter(p => p.orientation === EDITOR_CANVAS_LANDSCAPE))

    function setCanvasPreset(key: string) {
        canvasPresetKey.value = key
        clearSelection()
    }

    // keep orientation in sync with the active preset (only when the picker is on)
    watch(activeCanvasPreset, (preset) => {
        if (usePresetCanvas) canvasOrientation.value = preset.orientation
    }, { immediate: true })

    // ---- CANVAS DIMENSIONS ----
    const canvasWidth = computed(() => {
        if (usePresetCanvas) return activeCanvasPreset.value.width
        if (props.canvasImageBased && activeBgImage.value?.width) return activeBgImage.value.width
        const cs = activeCanvasSize.value
        return shouldFlipCanvas(canvasOrientation.value, cs.orientation) ? cs.height : cs.width
    })
    const canvasHeight = computed(() => {
        if (usePresetCanvas) return activeCanvasPreset.value.height
        if (props.canvasImageBased && activeBgImage.value?.height) return activeBgImage.value.height
        const cs = activeCanvasSize.value
        return shouldFlipCanvas(canvasOrientation.value, cs.orientation) ? cs.width : cs.height
    })

    // ---- BLOCKS ----
    const blockContainer = ref<ElementBlock[]>(cloneObject(props.defaultSelectedBlocks))
    const activeStaticBlocks = ref<string[]>([...props.defaultActiveStaticBlocks])

    // local, mutable static block definitions seeded with a perBreakpoint template
    // for every canvas size, so toggling a static block on restores its layout.
    const staticDefs = ref<ElementBlock[]>(props.staticBlocks.map((b) => {
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
        return block
    }))

    function findStaticDef(id: string) {
        return staticDefs.value.find(b => b.id === id)
    }
    function isStaticBlock(id: string) {
        return props.staticBlocks.some(b => b.id === id)
    }
    function findCustomBlock(id: string) {
        return props.customBlocks.find(b => b.id === id)
    }

    /** keep the static block definition in sync with its placed instance. */
    function syncStaticBlock(block: ElementBlock) {
        if (!isStaticBlock(block.id)) return
        const def = findStaticDef(block.id)
        if (!def) return
        def.style = cloneObject(block.style)
        def.setting = cloneObject(block.setting)
        def.x = block.x
        def.y = block.y
        def.perBreakpoint = cloneObject(block.perBreakpoint)
    }

    // Materialize any active static block that isn't already placed on the canvas
    // (e.g. a fresh template that enables a static block by default, like the
    // check-in scanner QR) so it actually renders instead of just being "checked".
    for (const id of activeStaticBlocks.value) {
        if (blockContainer.value.some(b => b.id === id)) continue
        const def = findStaticDef(id)
        if (!def) continue
        blockContainer.value.push({
            ...def,
            setting: cloneObject(def.setting),
            style: cloneObject(def.style),
            perBreakpoint: cloneObject(def.perBreakpoint),
        })
    }

    // ---- SELECTION ----
    const selectedIds = ref<number[]>([])
    const hoveredId = ref<number | null>(null)

    const selectedBlocks = computed(() => selectedIds.value
        .map(idx => blockContainer.value[idx])
        .filter((b): b is ElementBlock => !!b))
    const singleSelectedId = computed(() => (selectedIds.value.length === 1 ? selectedIds.value[0]! : null))
    const singleSelected = computed(() => (singleSelectedId.value !== null ? blockContainer.value[singleSelectedId.value] : undefined))
    const singleSelectedBp = computed(() => {
        const block = singleSelected.value
        return block?.perBreakpoint?.[activeCanvasSizeId.value]
    })

    function isSelected(idx: number) {
        return selectedIds.value.includes(idx)
    }
    function select(idx: number) {
        selectedIds.value = [idx]
    }
    function toggleSelection(idx: number) {
        const at = selectedIds.value.indexOf(idx)
        if (at > -1) selectedIds.value.splice(at, 1)
        else selectedIds.value.push(idx)
    }
    function selectMany(idxs: number[]) {
        selectedIds.value = [...idxs]
    }
    function clearSelection() {
        selectedIds.value = []
    }

    // ---- BLOCK READ HELPERS ----
    function bpOf(idx: number): Block | undefined {
        return blockContainer.value[idx]?.perBreakpoint?.[activeCanvasSizeId.value]
    }
    function getFontSize(bpBlock: Block): string {
        return String(getBlockStyleValue(bpBlock.style, BLOCK_STYLE_FONT_SIZE) ?? '1rem')
    }
    function getBoxSize(bpBlock: Block): { w: number, h: number } | null {
        // Treat empty/non-numeric values (e.g. an auto-sized text box whose
        // width/height are '') as absent so getBoxSize reports "no box" rather
        // than a bogus 0×0 one.
        const toPx = (v: unknown) => {
            const n = Number(String(v).replace(/px$/, ''))
            return Number.isFinite(n) && String(v).trim() !== '' ? n : undefined
        }
        const fromStyle = (key: string) => {
            const v = getBlockStyleValue(bpBlock.style, key)
            return v !== undefined ? toPx(v) : undefined
        }
        const fromSetting = (key: string) => {
            const found = bpBlock.setting.find(s => s.key === key)
            return found ? toPx(found.value) : undefined
        }
        const w = fromStyle(BLOCK_STYLE_WIDTH) ?? fromSetting(BLOCK_SETTING_WIDTH)
        const h = fromStyle(BLOCK_STYLE_HEIGHT) ?? fromSetting(BLOCK_SETTING_HEIGHT)
        if (w === undefined || h === undefined) return null
        return { w, h }
    }

    // ---- BLOCK MUTATIONS (operate on active breakpoint) ----
    function setPosition(idx: number, x: number, y: number) {
        const bpBlock = bpOf(idx)
        if (!bpBlock) return
        bpBlock.x = Number(clampPct(x).toFixed(2))
        bpBlock.y = Number(clampPct(y).toFixed(2))
        const block = blockContainer.value[idx]
        if (block && isStaticBlock(block.id)) syncStaticBlock(block)
    }
    function translateSelected(dxPct: number, dyPct: number) {
        for (const idx of selectedIds.value) {
            const bpBlock = bpOf(idx)
            if (!bpBlock) continue
            setPosition(idx, bpBlock.x + dxPct, bpBlock.y + dyPct)
        }
    }
    function setStyle(idx: number, key: string, value: string | boolean | number) {
        const bpBlock = bpOf(idx)
        const item = bpBlock?.style.find(s => s.key === key)
        if (!item) return
        item.value = value
        const block = blockContainer.value[idx]
        if (block && isStaticBlock(block.id)) syncStaticBlock(block)
    }
    function setSetting(idx: number, key: string, value: string | boolean | number) {
        const bpBlock = bpOf(idx)
        const item = bpBlock?.setting.find(s => s.key === key)
        if (!item) return
        item.value = value
        const block = blockContainer.value[idx]
        if (block && isStaticBlock(block.id)) syncStaticBlock(block)
    }
    function setValue(idx: number, value: string) {
        const block = blockContainer.value[idx]
        if (!block) return
        block.value = value
        if (isStaticBlock(block.id)) syncStaticBlock(block)
    }
    function setFontSize(idx: number, value: string) {
        setStyle(idx, BLOCK_STYLE_FONT_SIZE, value)
    }
    function setBoxSizePx(idx: number, w: number, h: number) {
        const bpBlock = bpOf(idx)
        if (!bpBlock) return
        const ws = `${Math.round(w)}px`
        const hs = `${Math.round(h)}px`
        const styleHasWidth = bpBlock.style.some(s => s.key === BLOCK_STYLE_WIDTH)
        if (styleHasWidth) {
            setStyle(idx, BLOCK_STYLE_WIDTH, ws)
            setStyle(idx, BLOCK_STYLE_HEIGHT, hs)
        }
        else {
            setSetting(idx, BLOCK_SETTING_WIDTH, ws)
            setSetting(idx, BLOCK_SETTING_HEIGHT, hs)
        }
    }
    /** EDITOR-ONLY: rotation is not persisted (see Block.rotate). */
    function setRotation(idx: number, deg: number) {
        const bpBlock = bpOf(idx)
        if (!bpBlock) return
        bpBlock.rotate = deg
    }

    // ---- ADD / DUPLICATE / REMOVE / TOGGLE ----
    function addBlockAt(blockId: string, xPct: number, yPct: number) {
        const block = findCustomBlock(blockId)
        if (!block) return
        const w = clampPct(xPct)
        const h = clampPct(yPct)

        const newBlock: ElementBlock = {
            ...block,
            setting: cloneObject(block.setting),
            style: cloneObject(block.style),
            x: w,
            y: h,
            perBreakpoint: {},
        }
        props.canvasSizeOptions.forEach((c) => {
            const shouldFlip = shouldFlipCanvas(c.orientation, activeCanvasSize.value.orientation)
            newBlock.perBreakpoint![c.id] = {
                id: block.id,
                type: block.type,
                value: block.value,
                setting: cloneObject(block.setting),
                style: cloneObject(block.style),
                x: shouldFlip ? h : w,
                y: shouldFlip ? w : h,
            }
        })
        blockContainer.value.push(newBlock)
        select(blockContainer.value.length - 1)
        commit()
    }
    function addBlockCenter(blockId: string) {
        addBlockAt(blockId, 50, 50)
    }

    function duplicateBlock(idx: number) {
        const block = blockContainer.value[idx]
        if (!block) return
        const newBlock: ElementBlock = {
            ...block,
            setting: cloneObject(block.setting),
            style: cloneObject(block.style),
            x: block.x + DUPLICATE_OFFSET,
            y: block.y + DUPLICATE_OFFSET,
            perBreakpoint: cloneObject(block.perBreakpoint),
        }
        if (newBlock.perBreakpoint) {
            Object.keys(newBlock.perBreakpoint).forEach((bp) => {
                if (!isBreakpoint(bp) || !newBlock.perBreakpoint![bp]) return
                newBlock.perBreakpoint![bp]!.x = clampPct(newBlock.perBreakpoint![bp]!.x + DUPLICATE_OFFSET)
                newBlock.perBreakpoint![bp]!.y = clampPct(newBlock.perBreakpoint![bp]!.y + DUPLICATE_OFFSET)
            })
        }
        blockContainer.value.push(newBlock)
        select(blockContainer.value.length - 1)
        commit()
    }
    function duplicateSelected() {
        const idx = singleSelectedId.value
        if (idx === null) return
        duplicateBlock(idx)
    }

    function removeBlock(idx: number) {
        const block = blockContainer.value[idx]
        if (!block) return
        if (isStaticBlock(block.id)) {
            const at = activeStaticBlocks.value.indexOf(block.id)
            if (at > -1) activeStaticBlocks.value.splice(at, 1)
        }
        blockContainer.value.splice(idx, 1)
        clearSelection()
        commit()
    }
    function removeSelected() {
        // remove from highest index down so earlier indices stay valid
        const idxs = [...selectedIds.value].sort((a, b) => b - a)
        for (const idx of idxs) {
            const block = blockContainer.value[idx]
            if (!block) continue
            if (isStaticBlock(block.id)) {
                const at = activeStaticBlocks.value.indexOf(block.id)
                if (at > -1) activeStaticBlocks.value.splice(at, 1)
            }
            blockContainer.value.splice(idx, 1)
        }
        clearSelection()
        commit()
    }

    function toggleStaticBlock(id: string) {
        const index = activeStaticBlocks.value.indexOf(id)
        if (index > -1) {
            activeStaticBlocks.value.splice(index, 1)
            const idx = blockContainer.value.findIndex(i => i.id === id)
            if (idx > -1) blockContainer.value.splice(idx, 1)
            clearSelection()
        }
        else {
            activeStaticBlocks.value.push(id)
            const def = findStaticDef(id)
            if (!def) return
            blockContainer.value.push({
                ...def,
                setting: cloneObject(def.setting),
                style: cloneObject(def.style),
                perBreakpoint: cloneObject(def.perBreakpoint),
            })
            select(blockContainer.value.length - 1)
        }
        commit()
    }

    // ---- LAYERS (z-order = array order; later = on top) ----
    function moveInArray(from: number, to: number) {
        if (from === to || from < 0 || to < 0 || from >= blockContainer.value.length || to >= blockContainer.value.length) return
        const [item] = blockContainer.value.splice(from, 1)
        blockContainer.value.splice(to, 0, item!)
    }
    function reorder(from: number, to: number) {
        moveInArray(from, to)
        select(to)
        commit()
    }
    function bringForward(idx: number) {
        reorder(idx, Math.min(idx + 1, blockContainer.value.length - 1))
    }
    function sendBackward(idx: number) {
        reorder(idx, Math.max(idx - 1, 0))
    }
    function bringToFront(idx: number) {
        reorder(idx, blockContainer.value.length - 1)
    }
    function sendToBack(idx: number) {
        reorder(idx, 0)
    }

    // ---- ALIGNMENT (within canvas, on active breakpoint) ----
    function align(kind: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') {
        const targets = selectedIds.value.length ? selectedIds.value : []
        for (const idx of targets) {
            const bpBlock = bpOf(idx)
            if (!bpBlock) continue
            switch (kind) {
                case 'left':
                    setPosition(idx, 0, bpBlock.y)
                    break
                case 'center-h':
                    setPosition(idx, 50, bpBlock.y)
                    break
                case 'right':
                    setPosition(idx, 100, bpBlock.y)
                    break
                case 'top':
                    setPosition(idx, bpBlock.x, 0)
                    break
                case 'center-v':
                    setPosition(idx, bpBlock.x, 50)
                    break
                case 'bottom':
                    setPosition(idx, bpBlock.x, 100)
                    break
            }
        }
        commit()
    }

    // ---- SAVE / PREVIEW (identical pipeline to the current editor) ----
    function flattenBlocksForBp(bp: Breakpoint): ElementBlock[] {
        const out: ElementBlock[] = []
        blockContainer.value.forEach((block, idx) => {
            const bpBlock = block.perBreakpoint?.[bp]
            if (!bpBlock) return
            out.push({
                ...block,
                uid: idx,
                elementId: bpBlock.elementId,
                value: block.value,
                style: cloneObject(bpBlock.style),
                setting: cloneObject(bpBlock.setting),
                x: bpBlock.x,
                y: bpBlock.y,
                perBreakpoint: undefined,
            })
        })
        return out
    }

    // the canvas dimensions saved into each variant's `setting`
    function variantSetting(): Record<string, string> {
        if (usePresetCanvas) {
            return { width: `${activeCanvasPreset.value.width}px`, height: `${activeCanvasPreset.value.height}px` }
        }
        if (props.canvasImageBased) {
            return { width: `${activeBgImage.value?.width || 0}px`, height: `${activeBgImage.value?.height || 0}px` }
        }
        return { width: `${activeCanvasSize.value.width}px`, height: `${activeCanvasSize.value.height}px` }
    }

    function makeVariants(preview = false): TemplateVariant[] {
        return selectedCanvasSizes.value.map((size) => {
            const slug = size.id
            // The backend changes a variant's background only via background_url_upload_key
            // (it ignores background_image_url on save), so we only send the upload key on a
            // real save; the dataUrl is used for the in-app preview only.
            return makeTemplateVariant(
                flattenBlocksForBp(slug),
                size.id,
                preview ? bgImage.value?.[slug]?.dataUrl || '' : '',
                bgImage.value?.[slug]?.uploadKey || '',
                size.variantId,
                variantSetting(),
            )
        })
    }

    const loading = ref(false)

    async function save(cb?: () => void) {
        if (!props.templateId) return
        try {
            loading.value = true
            const variants = makeVariants()
            const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/template/${props.templateId}`, {
                method: 'PUT',
                body: { variants },
            })
            if (data.success) {
                successToast({ description: 'Key visual been saved' })
                emit(EMIT_EDITOR_REFRESH)
                cb?.()
            }
            else {
                errorToast({ description: data.message })
            }
        }
        catch (error) {
            errorToast({ error, description: 'Failed to save key visual' })
        }
        finally {
            loading.value = false
        }
    }

    function preview() {
        if (!import.meta.client || !props.previewPath || !props.previewKey) return
        const variants = makeVariants(true)
        localStorage.setItem(props.previewKey, JSON.stringify(variants))
        window.open(props.previewPath, '_blank', 'noopener,noreferrer')
    }

    // Copies the standalone HTML document the editor produces (same output as
    // the backend / v1 preview) for the active breakpoint to the clipboard.
    async function copyHtml() {
        if (!import.meta.client) return
        try {
            const html = buildEditorHtml({
                blocks: blockContainer.value,
                staticBlockIds: activeStaticBlocks.value,
                findStaticBlock: findStaticDef,
                breakpoint: activeCanvasSizeId.value,
                bgImages: bgImage.value,
                width: canvasWidth.value,
                height: canvasHeight.value,
                fontOptions: props.fontOptions,
                htmlPreviewFn: props.htmlPreviewFn,
            })
            await navigator.clipboard.writeText(html)
            successToast({ description: 'HTML copied to clipboard' })
        }
        catch (error) {
            errorToast({ error, description: 'Failed to copy HTML' })
        }
    }

    function goBack() {
        router.go(-1)
    }

    // ---- HISTORY ----
    const history = useEditorHistory({
        // cloneObject (structuredClone(toRaw(...))) each field so structuredClone
        // never receives a Vue reactive Proxy — a Proxy-wrapped array is not a real
        // Array to the structured-clone algorithm and throws "[object Array] could
        // not be cloned". Passing each ref value through cloneObject unwraps the
        // proxy to a plain array first (same pattern used everywhere else here).
        snapshot: () => ({
            blockContainer: cloneObject(blockContainer.value),
            activeStaticBlocks: cloneObject(activeStaticBlocks.value),
            bgImage: cloneObject(bgImage.value),
            staticDefs: cloneObject(staticDefs.value),
        }),
        restore: (s) => {
            blockContainer.value = s.blockContainer
            activeStaticBlocks.value = s.activeStaticBlocks
            bgImage.value = s.bgImage
            staticDefs.value = s.staticDefs
            clearSelection()
        },
    })
    function commit() {
        history.commit()
    }
    // seed the initial history entry
    history.commit()

    return {
        // props passthrough (read-only usage in components)
        props,
        fontOptions: props.fontOptions,
        customBlocks: props.customBlocks,
        staticBlocks: props.staticBlocks,
        canvasSizeOptions: props.canvasSizeOptions,
        canvasImageBased: props.canvasImageBased,
        pageTitle: props.pageTitle,
        withPreview: props.withPreview,
        previewPath: props.previewPath,

        // canvas size / variants
        selectedCanvasSizeIds,
        activeCanvasSizeId,
        activeCanvasSize,
        selectedCanvasSizes,
        unselectedCanvasSizes,
        addCanvasSize,
        removeCanvasSize,
        setActiveCanvasSize,

        // orientation / scale
        canvasOrientation,
        canvasOrientationSelections,
        canvasScalePercentage,
        canvasScale,
        zoomBy,
        fitCanvasToViewport,

        // canvas size presets (image-based editors)
        canvasPresetKey,
        activeCanvasPreset,
        portraitPresets,
        landscapePresets,
        setCanvasPreset,

        // background
        bgImage,
        activeBgImage,
        uploadBackground,
        clearBackground,
        usingDefaultBackground,
        canResetBackground,
        resetBackground,

        // dimensions
        canvasWidth,
        canvasHeight,

        // blocks / selection
        blockContainer,
        activeStaticBlocks,
        selectedIds,
        hoveredId,
        selectedBlocks,
        singleSelectedId,
        singleSelected,
        singleSelectedBp,
        isSelected,
        select,
        toggleSelection,
        selectMany,
        clearSelection,

        // read helpers
        bpOf,
        getFontSize,
        getBoxSize,

        // mutations
        setPosition,
        translateSelected,
        setStyle,
        setSetting,
        setValue,
        setFontSize,
        setBoxSizePx,
        setRotation,
        addBlockAt,
        addBlockCenter,
        duplicateBlock,
        duplicateSelected,
        removeBlock,
        removeSelected,
        toggleStaticBlock,

        // layers / alignment
        reorder,
        bringForward,
        sendBackward,
        bringToFront,
        sendToBack,
        align,

        // save / preview / nav
        loading,
        save,
        preview,
        copyHtml,
        goBack,

        // history
        commit,
        undo: history.undo,
        redo: history.redo,
        canUndo: history.canUndo,
        canRedo: history.canRedo,
    }
}

export type EditorV2Context = ReturnType<typeof useEditorV2>

export const EDITOR_V2_KEY: InjectionKey<EditorV2Context> = Symbol('editor-v2')

export function useEditorV2Context(): EditorV2Context {
    const ctx = inject(EDITOR_V2_KEY)
    if (!ctx) throw new Error('useEditorV2Context must be used within EditorV2Main')
    return ctx
}
