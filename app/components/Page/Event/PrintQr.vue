<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
    selectedIds: number[]
    hide?: boolean
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])
const printConfirmation = defineModel<boolean>('open', { default: false })

const { $api } = useNuxtApp()
const { errorToast } = useErrorToast()
const printLoading = ref(false)

async function printQr() {
    const ids = props.selectedIds.length > 0 ? props.selectedIds : []
    try {
        printLoading.value = true
        const { data } = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/participant/print`, {
            method: 'POST',
            body: ids.length
                ? { document_type: 'invitation', participant_ids: ids }
                : { document_type: 'invitation' },
        })
        if (data.filepath) {
            const filename = data.filepath.split('/').pop()
            if (!filename) {
                errorToast({ description: 'Cannot read filename from filepath' })
                return
            }
            await useDownload(
                `/api/files/${data.filepath}`,
                filename,
            )
        }
        else {
            errorToast({ description: 'Cannot read filepath' })
            return
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to print QR' })
    }
    finally {
        printConfirmation.value = false
        printLoading.value = false
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
        @click="printConfirmation = true"
    >
        {{ `Print QR ${selectedIds.length ? `(${selectedIds.length})` : ''}` }}
    </UButton>

    <ModalConfirmNeutralAction
        v-model:open="printConfirmation"
        title="Print QR Confirmation"
        :body="`You will print ${selectedIds.length || 'All'} QR code of participants, Continue?`"
        confirm-label="Yes, Print The QR"
        :loading="printLoading"
        @confirm="printQr"
    />
</template>
