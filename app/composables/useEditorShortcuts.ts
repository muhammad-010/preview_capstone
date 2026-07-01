/**
 * Keyboard shortcuts for EditorV2. Call inside the editor root's setup; it
 * registers a window keydown listener and cleans it up on unmount.
 *
 * - Cmd/Ctrl+Z: undo            - Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y: redo
 * - Cmd/Ctrl+D: duplicate       - Delete/Backspace: remove selection
 * - Arrows: nudge (Shift = bigger step)  - Escape: deselect
 *
 * Shortcuts are ignored while typing in inputs/textareas/contenteditable.
 */
const NUDGE_SMALL = 0.5
const NUDGE_LARGE = 5

function isEditableTarget(el: EventTarget | null): boolean {
    if (!(el instanceof HTMLElement)) return false
    const tag = el.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

export function useEditorShortcuts(ctx: EditorV2Context) {
    function onKeydown(e: KeyboardEvent) {
        if (isEditableTarget(e.target)) return
        const meta = e.metaKey || e.ctrlKey
        const key = e.key
        const lower = key.toLowerCase()

        if (meta && lower === 'z' && !e.shiftKey) {
            e.preventDefault()
            ctx.undo()
            return
        }
        if ((meta && lower === 'z' && e.shiftKey) || (meta && lower === 'y')) {
            e.preventDefault()
            ctx.redo()
            return
        }
        if (meta && lower === 'd') {
            e.preventDefault()
            ctx.duplicateSelected()
            return
        }
        if ((key === 'Delete' || key === 'Backspace') && ctx.selectedIds.value.length) {
            e.preventDefault()
            ctx.removeSelected()
            return
        }
        if (key === 'Escape') {
            ctx.clearSelection()
            return
        }
        if (key.startsWith('Arrow') && ctx.selectedIds.value.length) {
            e.preventDefault()
            const step = e.shiftKey ? NUDGE_LARGE : NUDGE_SMALL
            const dx = key === 'ArrowLeft' ? -step : key === 'ArrowRight' ? step : 0
            const dy = key === 'ArrowUp' ? -step : key === 'ArrowDown' ? step : 0
            ctx.translateSelected(dx, dy)
            ctx.commit()
        }
    }

    onMounted(() => window.addEventListener('keydown', onKeydown))
    onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
