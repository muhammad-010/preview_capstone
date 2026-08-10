<script setup lang="ts">
const props = defineProps<{
    withSecond?: boolean
    maxValue?: ISOString
    minValue?: ISOString
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

const hours = computed(() => {
    let res = Array.from({ length: 24 }, (_, i) =>
        String(i).padStart(2, '0'),
    )

    if (props.maxValue) {
        res = res.filter(
            h => Number(h) <= new Date(props.maxValue!).getHours(),
        )
    }

    if (props.minValue) {
        res = res.filter(
            h => Number(h) >= new Date(props.minValue!).getHours(),
        )
    }

    return res
})

const minutes = computed(() => {
    let res = Array.from({ length: 60 }, (_, i) =>
        String(i).padStart(2, '0'),
    )

    const selectedHour = Number(hour.value)

    if (props.maxValue) {
        const maxDate = new Date(props.maxValue)
        const maxHour = maxDate.getHours()

        // Only restrict minutes when we're on the max hour
        if (selectedHour === maxHour) {
            res = res.filter(
                m => Number(m) <= maxDate.getMinutes(),
            )
        }
    }

    if (props.minValue) {
        const minDate = new Date(props.minValue)
        const minHour = minDate.getHours()

        // Only restrict minutes when we're on the min hour
        if (selectedHour === minHour) {
            res = res.filter(
                m => Number(m) >= minDate.getMinutes(),
            )
        }
    }

    return res
})

const seconds = computed(() => {
    let res = Array.from({ length: 60 }, (_, i) =>
        String(i).padStart(2, '0'),
    )

    const selectedHour = Number(hour.value)
    const selectedMinute = Number(minute.value)

    if (props.maxValue) {
        const maxDate = new Date(props.maxValue)
        const maxHour = maxDate.getHours()
        const maxMinute = maxDate.getMinutes()

        // Only restrict seconds when hour AND minute match max
        if (
            selectedHour === maxHour
            && selectedMinute === maxMinute
        ) {
            res = res.filter(
                s => Number(s) <= maxDate.getSeconds(),
            )
        }
    }

    if (props.minValue) {
        const minDate = new Date(props.minValue)
        const minHour = minDate.getHours()
        const minMinute = minDate.getMinutes()

        // Only restrict seconds when hour AND minute match min
        if (
            selectedHour === minHour
            && selectedMinute === minMinute
        ) {
            res = res.filter(
                s => Number(s) >= minDate.getSeconds(),
            )
        }
    }

    return res
})
</script>

<template>
    <div class="flex gap-2">
        <USelect
            v-model="hour"
            class="w-20"
            :items="hours"
            :ui="selectUI"
        />

        <USelect
            v-model="minute"
            class="w-20"
            :items="minutes"
            :ui="selectUI"
        />

        <USelect
            v-if="withSecond"
            v-model="second"
            class="w-20"
            :items="seconds"
            :ui="selectUI"
        />
    </div>
</template>
