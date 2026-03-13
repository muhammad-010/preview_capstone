<script setup lang="ts">
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const props = defineProps<{
    columns: number
}>()
const winners = defineModel<string>('winners', { default: '' })
const emit = defineEmits([EMIT_LOTTERY_DONE])

const {
    cols,
    offsets,
    slotRefs,
    spin,
} = useSpinLottery(computed(() => winners.value), NUMBERS, emit, props.columns)

defineExpose({ spin })
</script>

<template>
    <div class="relative flex gap-6">
        <div
            v-for="(col, i) in cols"
            :key="i"
            class="flex justify-center items-center h-52 w-36 rounded bg-yellow-400"
        >
            <div class="overflow-hidden h-48 w-32 rounded">
                <div
                    :ref="el => slotRefs[i] = el"
                    class="flex flex-col"
                    :style="{ transform: `translateY(${offsets[i]}px)` }"
                >
                    <div
                        v-for="(n, idx) in col"
                        :key="idx"
                        class="flex items-center justify-center h-48 text-8xl font-bold bg-white text-black"
                    >
                        {{ n }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
