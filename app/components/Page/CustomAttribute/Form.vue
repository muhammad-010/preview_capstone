<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
    customAttributes: CustomAttribute[]
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])
const toast = useToast()
const editedData = ref<number[]>([])
const deleteConfirmation = ref(false)
const deleteTarget = ref<CustomAttribute | null>(null)
const newData = ref<CustomAttribute[]>([])
const {
    createCustomAttribute,
    updateCustomAttribute,
    deleteCustomAttribute,
} = await useManageCustomAttribute(props.tenantId, props.eventId)

function addNewData() {
    newData.value.push({
        name: '',
    } as CustomAttribute)
}

function removeNewData(index: number) {
    newData.value.splice(index, 1)
}

async function saveNewData(attr: CustomAttribute, index: number) {
    try {
        await createCustomAttribute(attr)
        newData.value.splice(index, 1)
        toast.add({
            title: 'Success',
            description: 'A custom attribute has been created!',
            color: 'success',
        })
        emit(EMIT_DETAIL_REFRESH)
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to add new custom attribute',
            color: 'error',
        })
        console.error('Create custom attribute error', error)
    }
}

function markAsEdited(id: number) {
    if (!editedData.value.includes(id)) editedData.value = [...editedData.value, id]
}

function unmarkAsEdited(id: number) {
    editedData.value = editedData.value.filter(item => item !== id)
}

async function editData(attr: CustomAttribute) {
    try {
        await updateCustomAttribute(attr)
        toast.add({
            title: 'Success',
            description: 'A custom attribute has been updated!',
            color: 'success',
        })
        unmarkAsEdited(attr.custom_attribute_id)
        emit(EMIT_DETAIL_REFRESH)
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to update custom attribute',
            color: 'error',
        })
        console.error('Update custom attribute error', error)
    }
}

function confirmRemoveTarget(attr: CustomAttribute) {
    deleteTarget.value = attr
    deleteConfirmation.value = true
}

function closeConfirmRemoveTarget() {
    deleteTarget.value = null
    deleteConfirmation.value = false
}

async function removeTarget() {
    if (!deleteTarget.value) return
    try {
        await deleteCustomAttribute(deleteTarget.value)
        toast.add({
            title: 'Success',
            description: 'A custom attribute has been deleted!',
            color: 'success',
        })
        emit(EMIT_DETAIL_REFRESH)
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to delete custom attribute',
            color: 'error',
        })
        console.error('Delete custom attribute error', error)
    }
    finally {
        closeConfirmRemoveTarget()
    }
}
</script>

<template>
    <UCard class="my-8">
        <template #header>
            <div class="card-toolbar">
                <div class="card-toolbar-left">
                    <h3>Manage Custom Attributes</h3>
                </div>

                <div class="card-toolbar-actions">
                    <UButton
                        color="primary"
                        icon="lucide:plus"
                        class="cursor-pointer"
                        @click="addNewData"
                    >
                        Add Attributes
                    </UButton>
                </div>
            </div>
        </template>

        <div
            v-for="(attr, i) in newData"
            :key="i"
            class="flex items-center my-4"
        >
            <UInput
                v-model="attr.name"
                class="flex-1"
            />

            <div class="flex justify-between gap-4 ml-4">
                <UButton
                    icon="lucide:save"
                    label="Create"
                    @click="saveNewData(attr, i)"
                />
                <UButton
                    color="neutral"
                    variant="outline"
                    icon="lucide:ban"
                    label="Cancel"
                    @click="removeNewData(i)"
                />
            </div>
        </div>

        <div
            v-for="attr in customAttributes"
            :key="attr.custom_attribute_id"
            class="flex items-center my-4"
        >
            <UInput
                v-model="attr.name"
                :disabled="!editedData.includes(attr.custom_attribute_id)"
                class="flex-1"
            />

            <div class="flex justify-between gap-4 ml-4">
                <template v-if="editedData.includes(attr.custom_attribute_id)">
                    <UButton
                        color="neutral"
                        variant="outline"
                        icon="lucide:save"
                        label="Save"
                        @click="editData(attr)"
                    />
                    <UButton
                        color="error"
                        variant="outline"
                        icon="lucide:x"
                        label="Cancel"
                        @click="unmarkAsEdited(attr.custom_attribute_id)"
                    />
                </template>
                <template v-else>
                    <UButton
                        color="neutral"
                        variant="outline"
                        icon="lucide:pencil"
                        label="Update"
                        @click="markAsEdited(attr.custom_attribute_id)"
                    />
                    <UButton
                        color="error"
                        variant="outline"
                        icon="lucide:trash"
                        label="Delete"
                        @click="confirmRemoveTarget(attr)"
                    />
                </template>
            </div>
        </div>
    </UCard>

    <ModalConfirmNegativeAction
        v-model:open="deleteConfirmation"
        title="Delete Custom Attribute"
        :body="`Are you sure want to delete ${deleteTarget?.name}? This action can not be undone.`"
        confirm-label="Yes, Delete Custom Attribute"
        @cancel="closeConfirmRemoveTarget"
        @confirm="removeTarget"
    />
</template>
