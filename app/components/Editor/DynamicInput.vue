<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
const props = defineProps<{
    field: BlockSetting
    fontOptions?: TemplateFont[]
}>()
const emit = defineEmits([EMIT_INPUT_UPDATE])
const fontItems = computed(() => props.fontOptions
    ? [...props.fontOptions, ...BLOCK_STYLE_FONT_FAMILY_OPTIONS]
    : BLOCK_STYLE_FONT_FAMILY_OPTIONS,
)

function setValue(e: any) {
    emit(EMIT_INPUT_UPDATE, e)
}

/*
function getMultiValue(value: string | boolean | number) {
    return value && typeof value === 'string'
        ? value.split(',').map(v => v.trim()).filter(Boolean)
        : []
}

function setMultiValue(e: any) {
    if (e && Array.isArray(e) && e.every(item => typeof item === 'string')) {
        emit(EMIT_INPUT_UPDATE, e.join(','))
    }
    else {
        emit(EMIT_INPUT_UPDATE, e)
    }
}
*/
</script>

<template>
    <div>
        <!-- Checkbox -->
        <UCheckbox
            v-if="field.type === 'checkbox'"
            :model-value="field.value === field.trueValue"
            :label="field.label"
            :true-value="field.trueValue ?? true"
            :false-value="field.falseValue ?? false"
            @update:model-value="(e) => setValue(e ? field.trueValue : field.falseValue)"
        />

        <UFormField
            v-else
            class="mb-2"
            :label="field.label"
        >
            <!-- Select -->
            <USelect
                v-if="field.type === 'select' && field.options"
                :model-value="String(field.value)"
                :items="field.options"
                class="w-full"
                @update:model-value="setValue"
            />

            <!-- Font Select -->
            <USelect
                v-else-if="field.type === 'font-select' && fontOptions"
                :model-value="String(field.value)"
                :items="fontItems"
                label-key="name"
                class="w-full"
                @update:model-value="setValue"
            />

            <!-- Color -->
            <UPopover v-else-if="field.type === 'color'">
                <UButton
                    label="Choose color"
                    color="neutral"
                    variant="outline"
                >
                    <template #leading>
                        <span
                            :style="{ backgroundColor: String(field.value) }"
                            class="size-3 rounded-full"
                        />
                    </template>
                </UButton>

                <template #content>
                    <UColorPicker
                        :model-value="String(field.value)"
                        @update:model-value="(e) => setValue(e || '#000000')"
                    />
                </template>
            </UPopover>

            <!-- Number -->
            <UInputNumber
                v-else-if="field.type === 'number'"
                :model-value="Number(field.value)"
                class="w-full"
                :step="0.1"
                :min="field.min"
                :max="field.max"
                @update:model-value="setValue"
            />

            <!-- Default -->
            <UInput
                v-else
                :type="field.type"
                :model-value="String(field.value)"
                class="w-full"
                @update:model-value="setValue"
            />
        </UFormField>
    </div>
</template>
