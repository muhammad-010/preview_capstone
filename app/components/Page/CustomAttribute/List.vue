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

const { data, pending, refresh } = useApi(`/api/tenant/${props.tenantId}/event/${props.eventId}/attribute`, {
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
defineExpose({ refresh })

const customAttributes = computed<CustomAttribute[]>(() => data.value?.custom_attribute ?? [])
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
const formRef = ref()
const formLoading = ref(false)
const formSuccess = ref(false)
const targetId = ref<number | undefined>()
const target = ref<CustomAttributeForm | undefined>()

function openAddForm() {
    targetId.value = undefined
    target.value = undefined
    formDialog.value = true
}

function openEditForm(fields: CustomAttributeForm, id: number) {
    targetId.value = id
    target.value = fields
    formDialog.value = true
}

function closeForm(close: () => void) {
    close()
    target.value = undefined
}

async function saveForm(close: () => void) {
    try {
        await formRef.value.saveData()
        if (formSuccess.value) {
            close()
        }
    }
    catch { /* empty */ }
    formLoading.value = false
    refreshData()
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
                            placeholder="Search Custom Attribute"
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
                            Add Custom Attribute
                        </UButton>
                    </div>
                </div>
            </template>

            <UModal v-model:open="formDialog">
                <template #header="{ close }">
                    <div class="flex justify-between items-center w-full">
                        <h5>{{ target ? 'Edit' : 'Add' }} Custom Attribute</h5>

                        <UButton
                            color="neutral"
                            variant="ghost"
                            icon="lucide:x"
                            @click="() => closeForm(close)"
                        />
                    </div>
                </template>

                <template #body>
                    <MiscLoadingOverlay
                        :loading="formLoading"
                    >
                        <PageCustomAttributeForm
                            ref="formRef"
                            v-model:loading="formLoading"
                            v-model:success="formSuccess"
                            :tenant-id="tenantId"
                            :event-id="eventId"
                            :custom-attribute-id="targetId"
                            :fields="target"
                            is-modal
                        />
                    </MiscLoadingOverlay>
                </template>

                <template #footer="{ close }">
                    <div class="flex justify-end items-center w-full">
                        <div class="flex gap-2">
                            <UButton
                                color="neutral"
                                variant="outline"
                                icon="lucide:x"
                                class="cursor-pointer"
                                label="Cancel"
                                @click="() => closeForm(close)"
                            />
                            <UButton
                                color="primary"
                                icon="lucide:save"
                                class="cursor-pointer"
                                label="Save"
                                @click="() => saveForm(close)"
                            />
                        </div>
                    </div>
                </template>
            </UModal>

            <PageCustomAttributeTable
                v-model:limit="limit"
                v-model:page="page"
                :tenant-id="tenantId"
                :event-id="eventId"
                :data="customAttributes"
                :total="total"
                :pending="pending"
                with-pagination
                @refresh="refreshData"
                @open-edit="openEditForm"
            />
        </UCard>
    </div>
</template>
