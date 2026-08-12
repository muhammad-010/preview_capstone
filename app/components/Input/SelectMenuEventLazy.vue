<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    multiple?: boolean
}>()
const model = defineModel<(number | undefined)[] | number | undefined>()

const page = ref(1)
const search = ref('')
const query = ref('')
const hasMore = ref(true)

const { data, status, execute } = await useLazyApi(`/api/tenant/${props.tenantId}/event`, {
    transform: res => res.data,
    query: { query, page, limit: 10 },
})
const list = ref<TenantEvent[]>([])
watch(data, (newVal) => {
    if (newVal) {
        list.value.push(...newVal.event)
        hasMore.value = list.value.length < newVal.total_data
    }
})
watch(page, () => execute())
watch(search, (newVal, oldVal) => {
    if (status.value === 'pending') return

    const q = newVal.length >= 3
        ? newVal
        : oldVal.length > newVal.length && query.value !== ''
            ? ''
            : null

    if (q === null) return

    list.value = []
    query.value = q

    if (page.value === 1) {
        execute()
    }
    else {
        page.value = 1
    }
})

const selectMenu = useTemplateRef('selectMenuRef')
let removeSelectListener: (() => void) | null = null

function attachScrollSelectMenu() {
    nextTick(() => {
        const viewport = selectMenu.value?.viewportRef
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

function onOpen(open: boolean) {
    if (!open) {
        removeSelectListener?.()
        return
    }

    if (!list.value.length) {
        execute()
    }

    attachScrollSelectMenu()
}

onBeforeUnmount(() => removeSelectListener?.())
</script>

<template>
    <USelectMenu
        ref="selectMenuRef"
        v-model="model"
        v-model:search-term="search"
        :loading="status === 'pending'"
        :multiple="multiple"
        clear
        class="w-full"
        label-key="name"
        value-key="event_id"
        :items="list"
        placeholder="No Event Selected"
        @update:open="onOpen"
    />
</template>
