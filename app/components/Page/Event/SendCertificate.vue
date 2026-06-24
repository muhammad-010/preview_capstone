<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
    selectedIds: number[]
    hide?: boolean
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])
const sendConfirmation = defineModel<boolean>('open', { default: false })

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
const sendLoading = ref(false)

async function sendQr() {
    const ids = props.selectedIds.length > 0 ? props.selectedIds : []
    try {
        sendLoading.value = true
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/participant/send`, {
            method: 'POST',
            body: ids.length
                ? { document_type: 'certificate', channel: [SEND_CHANNEL_EMAIL], participant_ids: ids }
                : { document_type: 'certificate', channel: [SEND_CHANNEL_EMAIL] },
        })
        if (data.success) {
            successToast({ description: 'Certificate successfully sent' })
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to send QR' })
    }
    finally {
        sendConfirmation.value = false
        sendLoading.value = false
        emit(EMIT_DETAIL_REFRESH)
    }
}
</script>

<template>
    <UButton
        v-if="!hide"
        color="neutral"
        variant="outline"
        icon="lucide:send"
        class="cursor-pointer"
        @click="sendConfirmation = true"
    >
        {{ `Send Certificate ${selectedIds.length ? `(${selectedIds.length})` : ''}` }}
    </UButton>

    <ModalConfirmNeutralAction
        v-model:open="sendConfirmation"
        title="Send Certificate Confirmation"
        confirm-label="Yes, Send Certificate"
        :loading="sendLoading"
        @confirm="sendQr"
    >
        <div>
            {{ `You will send ${selectedIds.length || 'All'} certificate of participants, Continue?` }}
        </div>
    </ModalConfirmNeutralAction>
</template>
