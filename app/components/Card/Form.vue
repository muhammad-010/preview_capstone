<script setup lang="ts">
const props = defineProps<{
    title?: string
    subtitle?: string
    loading?: boolean
    cancelLabel?: string
    saveLabel?: string
    withStepper?: boolean
    totalStep?: number
    activeStepIndex?: number
}>()
const emit = defineEmits([EMIT_FORM_CANCEL, EMIT_FORM_SAVE, EMIT_FORM_NEXT_STEP, EMIT_FORM_PREV_STEP])

const showStepSubmit = computed(() => {
    return props.withStepper && ((props.activeStepIndex || 0) + 1) === (props.totalStep || 0)
})

const disableStepPrev = computed(() => {
    return props.withStepper && (props.activeStepIndex || 0) === 0
})
</script>

<template>
    <MiscLoadingOverlay :loading="loading">
        <UCard>
            <template
                v-if="title || subtitle"
                #header
            >
                <h3>{{ title }}</h3>
                <small>{{ subtitle }}</small>
            </template>

            <slot />

            <template #footer>
                <div
                    v-if="!withStepper"
                    class="flex justify-end items-center"
                >
                    <div class="flex gap-2">
                        <UButton
                            color="neutral"
                            variant="outline"
                            icon="lucide:x"
                            class="cursor-pointer"
                            @click="emit(EMIT_FORM_CANCEL)"
                        >
                            {{ cancelLabel ?? 'Cancel' }}
                        </UButton>
                        <UButton
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            @click="emit(EMIT_FORM_SAVE)"
                        >
                            {{ saveLabel ?? 'Save' }}
                        </UButton>
                    </div>
                </div>

                <div
                    v-else
                    class="flex justify-between items-center"
                >
                    <div class="flex gap-2">
                        <UButton
                            color="neutral"
                            variant="solid"
                            icon="lucide:chevron-left"
                            class="cursor-pointer"
                            :disabled="disableStepPrev"
                            @click="emit(EMIT_FORM_PREV_STEP)"
                        >
                            Previous Step
                        </UButton>
                    </div>

                    <div class="flex gap-2">
                        <UButton
                            color="neutral"
                            variant="outline"
                            icon="lucide:x"
                            class="cursor-pointer"
                            @click="emit(EMIT_FORM_CANCEL)"
                        >
                            {{ cancelLabel ?? 'Cancel' }}
                        </UButton>
                        <UButton
                            v-if="showStepSubmit"
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            @click="emit(EMIT_FORM_SAVE)"
                        >
                            {{ saveLabel ?? 'Save' }}
                        </UButton>
                        <UButton
                            v-else
                            color="primary"
                            icon="lucide:chevron-right"
                            class="cursor-pointer"
                            @click="emit(EMIT_FORM_NEXT_STEP)"
                        >
                            Next Step
                        </UButton>
                    </div>
                </div>
            </template>
        </UCard>
    </MiscLoadingOverlay>
</template>
