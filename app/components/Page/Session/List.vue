<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])

const search = ref('')
const query = ref('')
const page = ref(1)
const limit = ref(5)

const exposed = {
    refresh: () => {},
}
defineExpose(exposed)
const { data, pending, refresh } = await useApi(`/api/tenant/${props.tenantId}/event/${props.eventId}/session`, {
    transform: res => res.data,
    query: computed(() => {
        return {
            query: query.value,
            page: page.value,
            limit: limit.value,
        }
    }),
    watch: false,
})
exposed.refresh = refresh

const sessions = computed<TenantEventSession[]>(() => data.value?.event_session ?? [])
const total = computed(() => data.value?.total_data ?? 0)
watch(page, () => refresh())
watch(limit, () => refresh())

function searchData() {
    page.value = 1
    query.value = search.value
    refresh()
}

function clearSearch() {
    page.value = 1
    search.value = ''
    query.value = search.value
    refresh()
}

function refreshData() {
    refresh()
    emit(EMIT_DETAIL_REFRESH)
}

const formDialog = ref(false)
const targetId = ref<number | undefined>()
const target = ref<TenantEventSessionForm | undefined>()

function openAddForm() {
    targetId.value = undefined
    target.value = undefined
    formDialog.value = true
}

function openEditForm(fields: TenantEventSessionForm, id: number) {
    fields.start_time = formatISOWithoutOffset(fields.start_time)
    fields.end_time = formatISOWithoutOffset(fields.end_time)
    targetId.value = id
    target.value = fields
    formDialog.value = true
}
</script>

<template>
    <div class="my-8">
        <UCard>
            <template #header>
                <div class="card-toolbar">
                    <div class="card-toolbar-left-wrapper">
                        <DataTableSearch
                            v-model="search"
                            class="card-toolbar-left w-full"
                            placeholder="Search Session"
                            @search="searchData"
                            @clear="clearSearch"
                        />
                    </div>

                    <div class="card-toolbar-actions">
                        <UButton
                            color="primary"
                            icon="lucide:plus"
                            class="cursor-pointer"
                            @click="openAddForm"
                        >
                            Add Session
                        </UButton>
                    </div>
                </div>
            </template>

            <PageSessionModalForm
                v-model:open="formDialog"
                v-model:fields="target"
                v-model:id="targetId"
                :tenant-id="tenantId"
                :event-id="eventId"
                @refresh="refreshData"
            />

            <PageSessionTable
                v-model:limit="limit"
                v-model:page="page"
                :tenant-id="tenantId"
                :event-id="eventId"
                :data="sessions"
                :total="total"
                :pending="pending"
                with-pagination
                @refresh="refreshData"
                @open-edit="openEditForm"
            />
        </UCard>
    </div>
</template>
