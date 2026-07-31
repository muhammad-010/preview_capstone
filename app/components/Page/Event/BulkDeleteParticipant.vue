<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
    selectedIds: number[]
    hide?: boolean
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])
const bulkDeleteConfirmation = defineModel<boolean>('open', { default: false })

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
const bulkDeleteLoading = ref(false)

async function bulkDelete() {
    const ids = props.selectedIds.length > 0 ? props.selectedIds : []
    try {
        bulkDeleteLoading.value = true
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/ticket/bulk`, {
            method: 'DELETE',
            body: ids.length ? { ticket_ids: ids } : {},
        })
        if (data.success) {
            successToast({ description: 'Bulk delete success' })
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to bulk delete' })
    }
    finally {
        bulkDeleteConfirmation.value = false
        bulkDeleteLoading.value = false
        emit(EMIT_DETAIL_REFRESH)
    }
}
</script>

<template>
    <UButton
        v-if="!hide"
        color="neutral"
        variant="outline"
        icon="lucide:qr-code"
        class="cursor-pointer"
        @click="bulkDeleteConfirmation = true"
    >
        {{ `Bulk Delete ${selectedIds.length ? `(${selectedIds.length})` : ''}` }}
    </UButton>

    <ModalConfirmNegativeAction
        v-model:open="bulkDeleteConfirmation"
        title="Bulk Delete Participant Confirmation"
        :body="`You will delete ${selectedIds.length || 'All'} participants, Continue?`"
        :confirm-label="`Yes, Delete ${selectedIds.length || 'All'} Participants`"
        :loading="bulkDeleteLoading"
        @confirm="bulkDelete"
    />
</template>
