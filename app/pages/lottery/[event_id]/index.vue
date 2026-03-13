<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const { tenantId } = useUserState()
const eventId = Number(route.params.event_id)

async function useDetail(tId: number, id: number) {
    const { data } = await useApi(`/api/tenant/${tId}/event/${id}/detail`, {
        transform: res => ({
            ...res.data,
        }),
    })
    const event = computed<TenantEvent>(() => data.value ?? {} as TenantEvent)

    return {
        event,
    }
}

const { event } = await useDetail(tenantId.value, eventId)

// TODO: change to API Call
const prizePool = ref([
    { id: 1, name: 'Seperangkat Alat Mancing Piranha', qty: 2 },
    { id: 2, name: 'Seperangkat Alat Tayamum', qty: 6 },
    { id: 3, name: 'Seperangkat Alat Wudhu', qty: 10 },
])
const selectedPrize = ref()
const prizeName = computed(() => {
    const selected = selectedPrize.value
    const prizes = prizePool.value
    if (!selected) return 'No Prize Selected'
    if (!prizes) return 'No Prize Available'

    return prizes.filter(prize => prize.id === selected).map(prize => prize.name)[0] || 'Invalid Prize'
})
const prizeQty = computed(() => {
    const selected = selectedPrize.value
    const prizes = prizePool.value
    if (!selected) return '-'
    if (!prizes) return '-'

    return prizes.filter(prize => prize.id === selected).map(prize => `(${prize.qty} Remaining)`)[0] || '-'
})
const winnerDialog = ref(false)
const DUMMY_WINNERS = [
    'Bambank Kaneki',
    'Kuncung Balap',
    'Edi Sound Horeg',
]
const winner = ref({
    name: 'Bambank Kaneki',
    number: '14045',
})
const winnerNumber = computed(() => winner.value.number)
// const winnerName = computed(() => winner.value.name)
function continueSpin(close: () => void) {
    close()
    setTimeout(() => {
        winner.value = {
            name: DUMMY_WINNERS[Math.floor(Math.random() * 3)] || 'Bambank Kaneki',
            number: Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join(''),
        }
    }, 1000)
}
function markAsUnclaimed(close: () => void) {
    close()
    setTimeout(() => {
        winner.value = {
            name: DUMMY_WINNERS[Math.floor(Math.random() * 3)] || 'Bambank Kaneki',
            number: Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join(''),
        }
    }, 1000)
}

const slotRef = ref()
function spin() {
    // TODO: refresh before spin
    slotRef.value.spin()
}
function done() {
    winnerDialog.value = true
}

useHead({
    title: computed(() => `Lottery - ${event.value ? event.value.name : 'Event'}`),
})
definePageMeta({
    layout: 'lottery',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {
    [':event_id']: {
        param: route.params.event_id as string,
        label: event.value.name,
    },
}))
</script>

<template>
    <div class="my-8">
        <div class="flex justify-between mb-16">
            <UButton
                icon="lucide:chevron-left"
                color="neutral"
                variant="ghost"
                label="Back"
                @click="router.back()"
            />

            <h1>
                {{ event.name }}
            </h1>

            <UColorModeButton />
        </div>
        <div class="grid grid-cols-6 gap-8 w-full">
            <div class="flex flex-col justify-between items-center h-[75vh] w-full col-span-6 xl:col-span-4">
                <USelect
                    v-model="selectedPrize"
                    :items="prizePool"
                    value-key="id"
                    label-key="name"
                    class="ml-auto w-64"
                />

                <div class="flex flex-col items-center w-full">
                    <section class="text-center mb-12">
                        <div class="mb-4 text-7xl font-semibold">
                            {{ prizeName }}
                        </div>
                        <div class="text-3xl">
                            {{ prizeQty }}
                        </div>
                    </section>

                    <LotterySlot
                        ref="slotRef"
                        v-model:winners="winnerNumber"
                        :columns="winnerNumber.length"
                        class="mb-12"
                        @lottery-done="done"
                    />

                    <!-- <LotteryName
                        ref="slotRef"
                        v-model:winners="winnerName"
                        :names="DUMMY_WINNERS"
                        class="mb-12"
                        @lottery-done="done"
                    /> -->
                </div>

                <button
                    class="cursor-pointer py-6 px-18 bg-blue-500 font-bold text-4xl text-white rounded-xl"
                    @click="spin"
                >
                    <section class="flex justify-center items-center gap-4">
                        <UIcon name="lucide:sparkles" />
                        Draw Winner
                    </section>
                </button>
            </div>

            <UCard class="col-span-6 xl:col-span-2">
                <template #header>
                    <h2>
                        Winners Board
                    </h2>
                    Total Winner: 3
                </template>

                <template #default>
                    <div class="relative w-full max-h-[65vh] overflow-hidden">
                        <UMarquee
                            orientation="vertical"
                            :overlay="false"
                            :ui="{
                                root: '[--duration:60s] [--gap:--spacing(4)]',
                                content: 'w-full px-2',
                            }"
                        >
                            <UCard
                                v-for="n in 15"
                                :key="n"
                                class="w-full shrink-0"
                                :ui="{ root: 'ring-neutral', header: 'py-2' }"
                            >
                                <template #header>
                                    <span class="text-sm font-bold text-yellow-500">
                                        {{ n+14040 }}
                                    </span>
                                </template>

                                <span class="text-lg font-semibold">
                                    Bambank Kaneki
                                </span>
                                <br>
                                <span class="text-muted">
                                    Seperangkat Alat Wudhu {{ n }}
                                </span>
                            </UCard>
                        </UMarquee>
                    </div>
                </template>
            </UCard>
        </div>

        <UModal
            v-model:open="winnerDialog"
            :ui="{ content: 'max-w-4xl' }"
        >
            <template #content="{ close }">
                <div class="flex flex-col justify-center items-center text-center p-12">
                    <UIcon
                        name="lucide:party-popper"
                        class="text-warning size-32 mb-8"
                    />
                    <section class="mb-8 text-5xl font-bold">
                        Congratulations, {{ winner.name }}!
                    </section>
                    <section class="mb-8 text-2xl font-semibold">
                        Lottery Number:
                        <br>
                        <span class="text-5xl">
                            {{ winner.number }}
                        </span>
                    </section>
                    <section class="flex justify-evenly gap-8">
                        <button
                            class="cursor-pointer py-4 px-6 border-2 border-blue-500 font-bold text-3xl text-white rounded-xl"
                            @click="() => markAsUnclaimed(close)"
                        >
                            Redraw
                        </button>
                        <button
                            class="cursor-pointer py-4 px-6 bg-blue-500 font-bold text-3xl text-white rounded-xl"
                            @click="() => continueSpin(close)"
                        >
                            Claim
                        </button>
                    </section>
                </div>
            </template>
        </UModal>
    </div>
</template>
