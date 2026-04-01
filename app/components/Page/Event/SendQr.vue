<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
    selectedIds: number[]
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])

const { $api } = useNuxtApp()
const toast = useToast()
const sendConfirmation = ref(false)
const sendLoading = ref(false)
const sendChannels = ref(SEND_CHANNEL_DROPDOWN)
const selectedSendChannel = ref<SendChannel[]>([])

async function sendQr() {
    const ids = props.selectedIds.length > 0 ? props.selectedIds : []
    try {
        sendLoading.value = true
        await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/participant/invitation/send`, {
            method: 'POST',
            body: ids.length
                ? { channel: selectedSendChannel.value, participant_ids: ids }
                : { channel: selectedSendChannel.value },
        })
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to send QR',
            color: 'error',
        })
        console.error('Send QR error', error)
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
        color="neutral"
        variant="outline"
        icon="lucide:send"
        class="cursor-pointer"
        @click="sendConfirmation = true"
    >
        {{ `Send QR ${selectedIds.length ? `(${selectedIds.length})` : ''}` }}
    </UButton>

    <ModalConfirmNeutralAction
        v-model:open="sendConfirmation"
        title="Send QR Confirmation"
        confirm-label="Yes, Send The QR"
        :loading="sendLoading"
        @confirm="sendQr"
    >
        <div>
            {{ `You will send ${selectedIds.length || 'All'} QR code of participants, Continue?` }}
            <USeparator class="my-4" />
            <UCheckboxGroup
                v-model="selectedSendChannel"
                :items="sendChannels"
                variant="card"
                indicator="end"
                :ui="{ fieldset: 'gap-2' }"
            >
                <template #label="{ item: { id: scId } }">
                    {{ formatCapitalize(scId.split(':')[1] || '') }}
                </template>
            </UCheckboxGroup>
        </div>
    </ModalConfirmNeutralAction>
</template>
