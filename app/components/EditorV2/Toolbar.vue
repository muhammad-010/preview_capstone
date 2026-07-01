<script setup lang="ts">
/**
 * Canva-style contextual toolbar. Shows quick controls for the single selected
 * block (value + style/setting fields), or alignment + bulk actions when several
 * blocks are selected. Reuses EditorDynamicInput for field rendering.
 */
const ctx = useEditorV2Context()

const idx = computed(() => ctx.singleSelectedId.value)
const block = computed(() => ctx.singleSelected.value)
const bp = computed(() => ctx.singleSelectedBp.value)
const multi = computed(() => ctx.selectedIds.value.length > 1)

const styleFields = computed(() => bp.value?.style.filter(s => !s.hidden) ?? [])
const settingFields = computed(() => bp.value?.setting.filter(s => !s.hidden) ?? [])

function onStyle(key: string, value: string | boolean | number) {
    if (idx.value === null) return
    ctx.setStyle(idx.value, key, value)
    ctx.commit()
}
function onSetting(key: string, value: string | boolean | number) {
    if (idx.value === null) return
    ctx.setSetting(idx.value, key, value)
    ctx.commit()
}
function onValue(value: string) {
    if (idx.value === null) return
    ctx.setValue(idx.value, value)
    ctx.commit()
}
</script>

<template>
    <div class="flex items-center gap-2 flex-wrap min-h-9">
        <!-- multi-select: alignment + bulk -->
        <template v-if="multi">
            <span class="text-sm text-muted mr-1">{{ ctx.selectedIds.value.length }} selected</span>
            <UFieldGroup>
                <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="lucide:align-start-vertical"
                    @click="ctx.align('left')"
                />
                <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="lucide:align-center-vertical"
                    @click="ctx.align('center-h')"
                />
                <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="lucide:align-end-vertical"
                    @click="ctx.align('right')"
                />
                <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="lucide:align-start-horizontal"
                    @click="ctx.align('top')"
                />
                <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="lucide:align-center-horizontal"
                    @click="ctx.align('center-v')"
                />
                <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="lucide:align-end-horizontal"
                    @click="ctx.align('bottom')"
                />
            </UFieldGroup>
            <UButton
                size="sm"
                color="error"
                variant="soft"
                icon="lucide:trash-2"
                label="Delete"
                @click="ctx.removeSelected()"
            />
        </template>

        <!-- single select: quick fields + actions -->
        <template v-else-if="block && bp">
            <div
                v-if="block.withValue"
                class="w-48"
            >
                <UInput
                    :model-value="block.value"
                    size="sm"
                    placeholder="Value"
                    @update:model-value="(e: string) => onValue(e)"
                />
            </div>

            <div
                v-for="field in styleFields"
                :key="field.key"
                class="min-w-32"
            >
                <EditorDynamicInput
                    :field="field"
                    :font-options="ctx.fontOptions"
                    @update="(e) => onStyle(field.key, e)"
                />
            </div>

            <div
                v-for="field in settingFields"
                :key="field.key"
                class="min-w-32"
            >
                <EditorDynamicInput
                    :field="field"
                    :font-options="ctx.fontOptions"
                    @update="(e) => onSetting(field.key, e)"
                />
            </div>

            <div class="grow" />

            <UFieldGroup>
                <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="lucide:bring-to-front"
                    title="Bring forward"
                    @click="idx !== null && ctx.bringForward(idx)"
                />
                <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="lucide:send-to-back"
                    title="Send backward"
                    @click="idx !== null && ctx.sendBackward(idx)"
                />
            </UFieldGroup>
            <UButton
                size="sm"
                color="neutral"
                variant="outline"
                icon="lucide:copy"
                title="Duplicate"
                @click="idx !== null && ctx.duplicateBlock(idx)"
            />
            <UButton
                size="sm"
                color="error"
                variant="soft"
                icon="lucide:trash-2"
                title="Delete"
                @click="idx !== null && ctx.removeBlock(idx)"
            />
        </template>

        <!-- nothing selected -->
        <span
            v-else
            class="text-sm text-muted"
        >Select an element to edit it, or drag a block onto the canvas.</span>
    </div>
</template>
