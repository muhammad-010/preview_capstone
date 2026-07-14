<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

/**
 * Google-Docs-style font-size control: an editable numeric field with −/+
 * steppers plus a dropdown of preset sizes. Values are stored/emitted as a px
 * CSS string (e.g. "16px"); legacy rem values are shown as their px equivalent
 * and converted to px on the next edit.
 */
const props = withDefaults(defineProps<{
    modelValue: string
    min?: number
    max?: number
}>(), {
    min: 1,
    max: 400,
})
const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

function clampSize(n: number): number {
    return Math.min(props.max, Math.max(props.min, Math.round(n)))
}

// Parse the stored CSS value (px / rem / bare number) into a px number.
function parsePx(v: string): number {
    const s = String(v ?? '').trim()
    const n = parseFloat(s)
    if (!Number.isFinite(n)) return 16
    return clampSize(s.endsWith('rem') ? n * 16 : n)
}

const size = computed(() => parsePx(props.modelValue))

// Only emit on an actual change, keeping the two-way flow loop-safe.
function commit(n: number) {
    const next = clampSize(n)
    if (next !== size.value) emit('update:modelValue', `${next}px`)
}

const presetItems = computed<DropdownMenuItem[][]>(() => [
    BLOCK_STYLE_FONT_SIZE_PRESETS.map(p => ({
        label: String(p),
        icon: p === size.value ? 'lucide:check' : undefined,
        onSelect: () => commit(p),
    })),
])
</script>

<template>
    <UFieldGroup class="w-full">
        <UInputNumber
            :model-value="size"
            orientation="horizontal"
            :min="min"
            :max="max"
            :step="1"
            class="flex-1"
            @update:model-value="(v: number) => commit(Number(v))"
        />
        <UDropdownMenu
            :items="presetItems"
            :ui="{ content: 'min-w-16', item: 'cursor-pointer justify-center' }"
        >
            <UButton
                icon="lucide:chevron-down"
                color="neutral"
                variant="outline"
                aria-label="Font size presets"
            />
        </UDropdownMenu>
    </UFieldGroup>
</template>
