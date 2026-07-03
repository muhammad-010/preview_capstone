/**
 * Generic undo/redo history for EditorV2.
 *
 * The caller provides `snapshot()` to capture the current serializable editor
 * state and `restore()` to apply a captured snapshot. Snapshots are deep-cloned
 * on capture so later mutations don't corrupt history entries.
 */
export interface EditorHistoryOptions<T> {
    snapshot: () => T
    restore: (state: T) => void
    /** max entries kept (older entries are dropped). Default 50. */
    max?: number
}

export function useEditorHistory<T>(options: EditorHistoryOptions<T>) {
    const { snapshot, restore, max = 50 } = options

    const stack = ref<T[]>([]) as Ref<T[]>
    // index of the entry currently reflected in the editor
    const pointer = ref(-1)

    const canUndo = computed(() => pointer.value > 0)
    const canRedo = computed(() => pointer.value < stack.value.length - 1)

    /** Capture the current state as a new history entry. */
    function commit() {
        // drop any redo branch
        if (pointer.value < stack.value.length - 1) {
            stack.value.splice(pointer.value + 1)
        }
        stack.value.push(cloneObject(snapshot()))
        if (stack.value.length > max) {
            stack.value.shift()
        }
        pointer.value = stack.value.length - 1
    }

    function undo() {
        if (!canUndo.value) return
        pointer.value -= 1
        restore(cloneObject(stack.value[pointer.value]!))
    }

    function redo() {
        if (!canRedo.value) return
        pointer.value += 1
        restore(cloneObject(stack.value[pointer.value]!))
    }

    function clear() {
        stack.value = []
        pointer.value = -1
    }

    return { commit, undo, redo, canUndo, canRedo, clear }
}
