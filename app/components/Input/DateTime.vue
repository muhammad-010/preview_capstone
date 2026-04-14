<script setup lang="ts">
import { DateFormatter, parseAbsolute, getLocalTimeZone, CalendarDate, CalendarDateTime } from '@internationalized/date'

const model = defineModel<ISOString>({ default: new Date().toISOString() })
const dateModel = shallowRef(new CalendarDate(...getISODateArray(model.value)))
const hourModel = ref(getISOHourArray(model.value).map(e => String(e).padStart(2, '0')).join(':'))
const label = computed(() => {
    if (!model.value) return 'Select date and time'

    const d = df.format(parseAbsolute(model.value, getLocalTimeZone()).toDate())
    const [h, m, _] = hourModel.value.split(':')

    return `${d} at ${h}:${m}`
})
watch([dateModel, hourModel], ([newDate, newHour]) => {
    const [hour, minute, second] = newHour.split(':').map(Number)
    const date = new CalendarDateTime(newDate.year, newDate.month, newDate.day, hour, minute, second)
    model.value = date.toDate(getLocalTimeZone()).toISOString()
})

const df = new DateFormatter('en-US', {
    dateStyle: 'long',
})
</script>

<template>
    <UPopover>
        <UButton
            color="neutral"
            variant="outline"
            class="w-full"
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
                    />
                </div>
                <UCalendar
                    v-model="dateModel"
                    class="p-2"
                />
            </div>
        </template>
    </UPopover>
</template>
