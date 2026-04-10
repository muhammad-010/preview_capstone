<script setup lang="ts">
defineProps<{
    label: string
    activeCondition: boolean
    activeLabel: string
    alwaysShow?: boolean
}>()
const emit = defineEmits([EMIT_TABLE_FILTER_OPEN, EMIT_TABLE_FILTER_CLEAR])
</script>

<template>
    <UFieldGroup v-if="activeCondition || alwaysShow">
        <UButton
            color="neutral"
            variant="subtle"
            size="sm"
            :icon="`lucide:${activeCondition ? 'pencil' : 'plus'}`"
            :label="label"
            @click="emit(EMIT_TABLE_FILTER_OPEN)"
        />
        <UButton
            v-if="activeCondition"
            color="neutral"
            variant="outline"
            size="sm"
            :label="activeLabel"
            @click="emit(EMIT_TABLE_FILTER_OPEN)"
        />
        <UButton
            v-if="activeCondition"
            color="error"
            variant="subtle"
            size="sm"
            icon="lucide:x"
            @click="emit(EMIT_TABLE_FILTER_CLEAR)"
        />
    </UFieldGroup>
</template>
