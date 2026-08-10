<script setup lang="ts">
import {
    DateFormatter,
    parseAbsolute,
    getLocalTimeZone,
    CalendarDate,
    CalendarDateTime,
    parseDate,
    toZoned,
} from '@internationalized/date'

const props = defineProps<{
    disabled?: boolean
    maxValue?: ISOString
    minValue?: ISOString
}>()

const model = defineModel<ISOString | undefined>({ default: undefined })
const dateModel = shallowRef(model.value ? new CalendarDate(...getISODateArray(model.value)) : undefined)
const hourModel = ref(model.value ? getISOHourArray(model.value).map(e => String(e).padStart(2, '0')).join(':') : undefined)
const label = computed(() => {
    if (!model.value || !dateModel.value || !hourModel.value) return 'Select date and time'

    const d = df.format(parseAbsolute(model.value, getLocalTimeZone()).toDate())
    const [h, m, _] = hourModel.value.split(':')

    return `${d} at ${h}:${m}`
})
watch([dateModel, hourModel], ([newDate, newHour]) => {
    if (!newDate || !newHour) return

    const [hour, minute, second] = newHour.split(':').map(Number)
    const date = new CalendarDateTime(newDate.year, newDate.month, newDate.day, hour, minute, second)
    model.value = date.toDate(getLocalTimeZone()).toISOString()
})

const df = new DateFormatter('en-US', {
    dateStyle: 'long',
})

const maxDate = computed(() => props.maxValue ? parseDate(props.maxValue.slice(0, 10)) : undefined)
const minDate = computed(() => props.minValue ? parseDate(props.minValue.slice(0, 10)) : undefined)
const maxTime = computed(() => {
    if (dateModel.value && props.maxValue) {
        const date = new CalendarDateTime(dateModel.value.year, dateModel.value.month, dateModel.value.day)
        const iso = toZoned(date, getLocalTimeZone()).toString().replace(/\[.*\]$/, '')
        return iso.slice(0, 10) === props.maxValue.slice(0, 10) ? props.maxValue : undefined
    }
    return undefined
})
const minTime = computed(() => {
    if (dateModel.value && props.minValue) {
        const date = new CalendarDateTime(dateModel.value.year, dateModel.value.month, dateModel.value.day)
        const iso = toZoned(date, getLocalTimeZone()).toString().replace(/\[.*\]$/, '')
        return iso.slice(0, 10) === props.minValue.slice(0, 10) ? props.minValue : undefined
    }
    return undefined
})
</script>

<template>
    <UPopover>
        <UButton
            color="neutral"
            variant="outline"
            class="w-full"
            :disabled="disabled"
            :ui="{ base: 'justify-start!' }"
        >
            {{ label }}
        </UButton>

        <template #content>
            <div class="p-4">
                <div class="flex gap-2 items-center">
                    <UIcon
                        name="lucide:calendar"
                        class="size-8"
                    />
                    <UInput
                        :value="dateModel
                            ? df.format(dateModel.toDate(getLocalTimeZone()))
                            : 'Select a date'
                        "
                        readonly
                        class="w-full"
                    />
                    <UIcon
                        name="lucide:clock"
                        class="size-8"
                    />
                    <InputTimePicker
                        v-model="hourModel"
                        :min-value="minTime"
                        :max-value="maxTime"
                    />
                </div>
                <UCalendar
                    v-model="dateModel"
                    class="p-2"
                    :min-value="minDate"
                    :max-value="maxDate"
                />
            </div>
        </template>
    </UPopover>
</template>
