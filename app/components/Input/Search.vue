<script setup lang="ts">
defineProps<{
    placeholder?: string
}>()
const model = defineModel<string>()
const emit = defineEmits([EMIT_INPUT_SEARCH, EMIT_INPUT_CLEAR])
</script>

<template>
    <UFieldGroup>
        <UInput
            v-model="model"
            class="max-lg:w-full"
            type="text"
            :placeholder="placeholder ?? 'Search'"
            :ui="{ trailing: 'pe-1' }"
            @keyup.enter="emit(EMIT_INPUT_SEARCH)"
        >
            <template #trailing>
                <UButton
                    v-if="model"
                    color="neutral"
                    variant="link"
                    size="sm"
                    icon="lucide:x"
                    @click="emit(EMIT_INPUT_CLEAR)"
                />
            </template>
        </UInput>

        <UTooltip text="Click or press enter to start searching">
            <UButton
                color="neutral"
                variant="subtle"
                icon="lucide:search"
                @click="emit(EMIT_INPUT_SEARCH)"
            />
        </UTooltip>
    </UFieldGroup>
</template>
