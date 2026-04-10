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
const toast = useToast()
const printLoading = ref(false)

async function printQr() {
    const ids = props.selectedIds.length > 0 ? props.selectedIds : []
    try {
        printLoading.value = true
        const { data } = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/participant/invitation/print`, {
            method: 'POST',
            body: ids.length ? { participant_ids: ids } : {},
        })
        if (data.filepath) {
            const filename = data.filepath.split('/').pop()
            if (!filename) {
                toast.add({
                    title: 'Error',
                    description: 'Cannot read filename',
                    color: 'error',
                })
                console.error('Print QR error: can\'t read filename')
                return
            }
            await useDownload(
                `/api/files/${data.filepath}`,
                filename,
            )
        }
        else {
            toast.add({
                title: 'Error',
                description: 'Cannot read filepath',
                color: 'error',
            })
            console.error('Print QR error: can\'t read filepath')
            return
        }
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to print QR',
            color: 'error',
        })
        console.error('Print QR error', error)
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
