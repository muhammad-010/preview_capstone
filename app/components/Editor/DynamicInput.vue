<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
defineProps<{
    field: BlockSetting
}>()
const emit = defineEmits([EMIT_INPUT_UPDATE])

function setValue(e: any) {
    emit(EMIT_INPUT_UPDATE, e)
}
</script>

<template>
    <div>
        <!-- Checkbox -->
        <UCheckbox
            v-if="field.type === 'checkbox'"
            :model-value="field.value === field.trueValue"
            :label="field.label"
            :true-value="field.trueValue !== undefined ? field.trueValue : true"
            :false-value="field.falseValue !== undefined ? field.falseValue : false"
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
            <UInput
                v-else-if="field.type === 'number'"
                type="number"
                :model-value="Number(field.value)"
                class="w-full"
                :step="0.1"
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
