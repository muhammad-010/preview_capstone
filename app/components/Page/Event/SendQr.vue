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
const sendChannels = ref(SEND_CHANNEL_DROPDOWN)
const selectedSendChannel = ref<SendChannel[]>([])

async function sendQr() {
    const ids = props.selectedIds.length > 0 ? props.selectedIds : []
    try {
        sendLoading.value = true
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/participant/invitation/send`, {
            method: 'POST',
            body: ids.length
                ? { channel: selectedSendChannel.value, participant_ids: ids }
                : { channel: selectedSendChannel.value },
        })
        if (data.success) {
            successToast({ description: 'QR successfully sent' })
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
