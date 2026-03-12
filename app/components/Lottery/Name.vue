<script setup lang="ts">
const props = defineProps<{
    names: string[]
}>()
const winners = defineModel<string>('winners', { default: '' })
const emit = defineEmits([EMIT_LOTTERY_DONE])

const {
    cols,
    offsets,
    slotRefs,
    spin,
} = useSpinLottery(computed(() => winners.value), props.names, emit)

defineExpose({ spin })
</script>

<template>
    <div class="relative flex gap-6 w-full">
        <div
            v-for="(col, i) in cols"
            :key="i"
            class="overflow-hidden h-52 w-full rounded"
        >
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
</template>
