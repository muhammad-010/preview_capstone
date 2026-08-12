<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    distributeTarget?: Distribute
}>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits([EMIT_MODAL_CLOSE])

function onClose(close: () => void) {
    emit(EMIT_MODAL_CLOSE)
    close()
}

const page = ref(1)
const hasMore = ref(true)

const { data, status, execute } = await useLazyApi(
    () => `/api/tenant/${props.tenantId}/distribute/recipient/${props.distributeTarget?.notification_recipient_id}/history`,
    {
        transform: res => res.data,
        query: computed(() => ({
            page: page.value,
            limit: 10,
            type: props.distributeTarget?.type,
            channel: props.distributeTarget?.channel,
        })),
        immediate: false,
    })
const list = ref<Distribute[]>([])
const total = computed(() => data.value?.total_data ?? 0)
watch(data, (newVal) => {
    if (newVal) {
        list.value.push(...newVal.recipients)
        hasMore.value = list.value.length < newVal.total_data
    }
})
watch(page, () => execute())

const lazyScroller = useTemplateRef('lazyScrollerRef')
let removeSelectListener: (() => void) | null = null

function attachScrollSelectMenu() {
    nextTick(() => {
        const viewport = lazyScroller.value
        if (!viewport) return

        const onScroll = () => {
            if (status.value === 'pending') return

            const threshold = 100
            if ((viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - threshold) && hasMore.value) {
                page.value++
            }
        }

        viewport.addEventListener('scroll', onScroll)
        removeSelectListener = () => {
            viewport.removeEventListener('scroll', onScroll)
        }
    })
}

watch(open, (newVal) => {
    if (!newVal) {
        removeSelectListener?.()
        list.value = []
        return
    }

    if (!list.value.length && props.distributeTarget) {
        execute()
    }

    attachScrollSelectMenu()
})

onBeforeUnmount(() => removeSelectListener?.())
</script>

<template>
    <UModal v-model:open="open">
        <template #header="{ close }">
            <div class="flex justify-between items-center w-full">
                <div>
                    <h5>Distribution History</h5>
                    <span class="text-toned">{{ distributeTarget ? distributeTarget.recipient_name : '-' }}</span>
                </div>

                <UButton
                    color="neutral"
                    variant="ghost"
                    icon="lucide:x"
                    @click="() => onClose(close)"
                />
            </div>
        </template>

        <template #body>
            <div class="flex flex-col gap-2">
                <div class="mb-2">
                    <b>{{ total }}</b> total distribution attempt for this participant
                </div>

                <div
                    ref="lazyScrollerRef"
                    class="max-h-60 overflow-y-auto pr-4"
                >
                    <div
                        v-for="item, idx in list"
                        :key="item.notification_recipient_id"
                        class="py-2 px-4 flex items-center justify-between rounded-lg bg-primary-50 dark:bg-primary-950 not-last:mb-2"
                    >
                        <div class="flex items-center gap-4">
                            {{ idx+1 }}
                            <UAvatar
                                :icon="`lucide:${item.channel === DISTRIBUTE_CHANNEL_EMAIL ? 'mail' : 'message-circle'}`"
                                size="lg"
                                :color="`${item.channel === DISTRIBUTE_CHANNEL_EMAIL ? 'info' : 'success'}`"
                            />

                            <div>
                                <p class="text-sm font-semibold">
                                    {{ formatCapitalize(Object.entries(DISTRIBUTE_TYPE_ENUM).find(([, value]) => value === item.type)?.[0] ?? '-') }} - {{ formatCapitalize(item.channel) }}
                                </p>
                                <span class="text-xs text-toned">{{ formatLongDate(item.created_at ?? item.status_updated_at) }}</span>
                            </div>
                        </div>

                        <UBadge
                            :color="DISTRIBUTE_STATUS_COLORS[item.status]"
                            variant="subtle"
                            :label="formatCapitalize(item.status)"
                        />
                    </div>
                </div>
            </div>
        </template>
    </UModal>
</template>
