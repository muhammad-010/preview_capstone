<script setup lang="ts">
/**
 * Inspector for the selected block: precise position, rotation, value, and the
 * full style/setting fields (reusing EditorDynamicInput). Mutations go through
 * the store and snapshot history on change.
 */
const ctx = useEditorV2Context()

const idx = computed(() => ctx.singleSelectedId.value)
const block = computed(() => ctx.singleSelected.value)
const bp = computed(() => ctx.singleSelectedBp.value)

// EditorV2 opts the font-size field into the Google-Docs-style control; V1 keeps
// its plain text input (it renders the field with its original `type`).
const styleFields = computed(() => (bp.value?.style.filter(s => !s.hidden) ?? [])
    .map(s => s.key === BLOCK_STYLE_FONT_SIZE ? { ...s, type: 'font-size' } : s))
const settingFields = computed(() => bp.value?.setting.filter(s => !s.hidden) ?? [])

function onPos(axis: 'x' | 'y', value: number) {
    if (idx.value === null || !bp.value) return
    ctx.setPosition(idx.value, axis === 'x' ? value : bp.value.x, axis === 'y' ? value : bp.value.y)
    ctx.commit()
}
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
    <div class="flex flex-col gap-4 overflow-y-auto scrollbar pr-1">
        <template v-if="block && bp">
            <!-- POSITION + ROTATION -->
            <UCard :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }">
                <template #header>
                    <h5>Transform</h5>
                </template>

                <div class="grid grid-cols-2 gap-2">
                    <UFormField label="X (%)">
                        <UInputNumber
                            :model-value="bp.x"
                            :step="0.2"
                            :min="0"
                            :max="100"
                            @update:model-value="(v) => onPos('x', Number(v))"
                        />
                    </UFormField>
                    <UFormField label="Y (%)">
                        <UInputNumber
                            :model-value="bp.y"
                            :step="0.2"
                            :min="0"
                            :max="100"
                            @update:model-value="(v) => onPos('y', Number(v))"
                        />
                    </UFormField>
                </div>
            </UCard>

            <!-- VALUE + SETTINGS -->
            <UCard
                v-if="block.withValue || settingFields.length"
                :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }"
            >
                <template #header>
                    <h5>Content</h5>
                </template>

                <UFormField
                    v-if="block.withValue"
                    label="Value"
                    class="mb-3"
                >
                    <UInput
                        :model-value="block.value"
                        class="w-full"
                        @update:model-value="(e: string) => onValue(e)"
                    />
                </UFormField>

                <EditorDynamicInput
                    v-for="field in settingFields"
                    :key="field.key"
                    class="mb-3"
                    :field="field"
                    :font-options="ctx.fontOptions"
                    @update="(e) => onSetting(field.key, e)"
                />
            </UCard>

            <!-- STYLE -->
            <UCard
                v-if="styleFields.length"
                :ui="{ header: 'p-2 sm:px-3', body: 'p-2 sm:p-3' }"
            >
                <template #header>
                    <h5>Style</h5>
                </template>

                <EditorDynamicInput
                    v-for="field in styleFields"
                    :key="field.key"
                    class="mb-3"
                    :field="field"
                    :font-options="ctx.fontOptions"
                    @update="(e) => onStyle(field.key, e)"
                />
            </UCard>
        </template>

        <div
            v-else
            class="text-sm text-muted p-2"
        >
            Select a single element to edit its properties.
        </div>
    </div>
</template>
