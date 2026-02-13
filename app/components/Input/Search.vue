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
            type="text"
            placeholder="Search"
            :ui="{ trailing: 'pe-1' }"
            @keyup.enter="emit(EMIT_INPUT_SEARCH)"
        >
            <template #trailing>
                <UButton
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
            />
        </UTooltip>
    </UFieldGroup>
</template>
