<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
    eventTitle?: string
}>()
const storeId = defineModel<number | null>('store-id', { default: null })
const emit = defineEmits([EMIT_DETAIL_REFRESH])

const exposed = {
    refresh: () => {},
}
defineExpose(exposed)
const { data, refresh } = await useApi(
    () => `/api/tenant/${props.tenantId}/event/${props.eventId}/store/${storeId.value}/detail`,
    {
        transform: res => ({
            ...res.data,
        }),
        immediate: false,
    })
watch(() => storeId.value, (value) => {
    if (value !== null) refresh()
}, { immediate: true })
exposed.refresh = refresh
const store = computed(() => data.value ?? null)

function refreshData() {
    emit(EMIT_DETAIL_REFRESH)
    if (store.value?.store_id) {
        refresh()
    }
}

const formDialog = ref(false)
const targetId = ref<number | undefined>()
const target = ref<TenantEventStoreForm | undefined>()

function openAddForm() {
    targetId.value = undefined
    target.value = undefined
    formDialog.value = true
}

function openEditForm(id: number) {
    if (!store.value) return

    targetId.value = id
    target.value = {
        title: store.value.title,
        subtitle: store.value.subtitle,
        slug: store.value.slug,
        is_open: store.value.is_open,
    }
    formDialog.value = true
}
</script>

<template>
    <div class="my-8">
        <template v-if="!store">
            <div class="flex flex-col justify-center items-center h-[50vh]">
                <UIcon
                    name="lucide:store"
                    class="size-24 mb-4"
                />
                <h1 class="mb-2">
                    Looks like you don't have a store for this event
                </h1>
                <h3 class="mb-2">
                    You can create one to sell ticket and merch
                </h3>
                <UButton
                    size="xl"
                    icon="lucide:plus"
                    label="Create Store"
                    @click="openAddForm"
                />
            </div>
        </template>

        <template v-else>
            <PageStoreCard
                :store="store"
                :event-title="eventTitle"
                @open-edit="(id) => openEditForm(id)"
            />
        </template>

        <PageStoreModalForm
            v-model:open="formDialog"
            v-model:fields="target"
            v-model:id="targetId"
            :tenant-id="tenantId"
            :event-id="eventId"
            @refresh="refreshData"
        />
    </div>
</template>
