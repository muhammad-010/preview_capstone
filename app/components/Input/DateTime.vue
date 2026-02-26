<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { DateFormatter, parseAbsolute, getLocalTimeZone } from '@internationalized/date'

const model = defineModel<ISOString>()
const dateModel = computed<DateValue | null>({
    get() {
        return !model.value ? null : parseAbsolute(model.value, getLocalTimeZone())
    },
    set(value) {
        if (!value) {
            model.value = ''
            return
        }

        const iso = new Date(Date.UTC(
            value.year,
            value.month - 1,
            value.day,
            0, 0, 0,
        )).toISOString()

        model.value = iso
    },
})
const hourModel = computed<string>({
    get() {
        if (!model.value) return '00:00:00'

        const date = new Date(model.value)

        const h = String(date.getUTCHours()).padStart(2, '0')
        const m = String(date.getUTCMinutes()).padStart(2, '0')
        const s = String(date.getUTCSeconds()).padStart(2, '0')

        return `${h}:${m}:${s}`
    },
    set(value) {
        if (!value) return

        const [hour, minute, second] = value.split(':').map(Number)

        const date = model.value
            ? new Date(model.value)
            : new Date()

        date.setUTCHours(hour || 0)
        date.setUTCMinutes(minute || 0)
        date.setUTCSeconds(second || 0)

        model.value = date.toISOString()
    },
})
const formatter = new DateFormatter('en-US', {
    dateStyle: 'long',
})
function inputLabel() {
    if (!model.value) return 'Select date and time'

    const d = formatter.format(parseAbsolute(model.value, getLocalTimeZone()).toDate())
    const [h, m, _] = hourModel.value.split(':')

    return `${d} at ${h}:${m}`
}
</script>

<template>
    <UPopover>
        <UButton
            color="neutral"
            variant="outline"
            class="w-full"
            :ui="{ base: 'justify-start!' }"
        >
            {{ inputLabel() }}
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
                            ? formatter.format(dateModel.toDate(getLocalTimeZone()))
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
