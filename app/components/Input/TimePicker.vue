<script setup lang="ts">
defineProps<{
    withSecond?: boolean
}>()
const model = defineModel<string | undefined>({ default: undefined })

function parseTime(value?: string) {
    const [h = '00', m = '00', s = '00'] = value?.split(':') ?? []
    return {
        h: h.padStart(2, '0'),
        m: m.padStart(2, '0'),
        s: s.padStart(2, '0'),
    }
}

const hour = computed({
    get() {
        return parseTime(model.value).h
    },
    set(val: string) {
        const { m, s } = parseTime(model.value)
        model.value = `${val}:${m}:${s}`
    },
})

const minute = computed({
    get() {
        return parseTime(model.value).m
    },
    set(val: string) {
        const { h, s } = parseTime(model.value)
        model.value = `${h}:${val}:${s}`
    },
})

const second = computed({
    get() {
        return parseTime(model.value).s
    },
    set(val: string) {
        const { h, m } = parseTime(model.value)
        model.value = `${h}:${m}:${val}`
    },
})

const selectUI = {
    viewport: 'scrollbar',
}
</script>

<template>
    <div class="flex gap-2">
        <USelect
            v-model="hour"
            class="w-20"
            :items="Array.from({ length: 24 }, (_, i) =>
                String(i).padStart(2, '0'),
            )"
            :ui="selectUI"
        />

        <USelect
            v-model="minute"
            class="w-20"
            :items="Array.from({ length: 60 }, (_, i) =>
                String(i).padStart(2, '0'),
            )"
            :ui="selectUI"
        />

        <USelect
            v-if="withSecond"
            v-model="second"
            class="w-20"
            :items="Array.from({ length: 60 }, (_, i) =>
                String(i).padStart(2, '0'),
            )"
            :ui="selectUI"
        />
    </div>
</template>
