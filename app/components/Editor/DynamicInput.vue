<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
const props = defineProps<{
    field: BlockSetting
}>()

const emit = defineEmits([EMIT_INPUT_UPDATE])

function getValue() {
    return props.field.value
}

function setValue(e: any) {
    emit(EMIT_INPUT_UPDATE, e)
}
</script>

<template>
    <div>
        <!-- Checkbox -->
        <UCheckbox
            v-if="field.type === 'checkbox'"
            :model-value="Boolean(getValue())"
            :label="field.label"
            @update:model-value="setValue"
        />

        <UFormField
            v-else
            class="mb-2"
            :label="field.label"
        >
            <!-- Select -->
            <USelect
                v-if="field.type === 'select' && field.options"
                :model-value="String(getValue())"
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
                            :style="{ backgroundColor: String(getValue()) }"
                            class="size-3 rounded-full"
                        />
                    </template>
                </UButton>

                <template #content>
                    <UColorPicker
                        :model-value="String(getValue())"
                        @update:model-value="(e) => setValue(e || '#000000')"
                    />
                </template>
            </UPopover>

            <!-- Number -->
            <UInput
                v-else-if="field.type === 'number'"
                type="number"
                :model-value="Number(getValue())"
                class="w-full"
                :step="0.1"
                @update:model-value="setValue"
            />

            <!-- Default -->
            <UInput
                v-else
                :type="field.type"
                :model-value="String(getValue())"
                class="w-full"
                @update:model-value="setValue"
            />
        </UFormField>
    </div>
</template>
