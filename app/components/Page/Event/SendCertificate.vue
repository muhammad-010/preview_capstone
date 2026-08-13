<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
    selectedIds: number[]
    query: string
    filterCustomAttribute: CustomAttribute[]
    filterSessionStatus: ParticipantSessionStatus | null
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
        const cleanedFilterCustomAttribute = formatCleanCustomAttribute(props.filterCustomAttribute)
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/ticket/send`, {
            method: 'POST',
            body: {
                document_type: 'certificate',
                channel: [SEND_CHANNEL_EMAIL],
                ...(props.query ? { query: props.query } : {}),
                ...(ids.length ? { ticket_ids: ids } : {}),
                ...(props.filterSessionStatus !== null
                    ? { check_in_session: props.filterSessionStatus }
                    : {}
                ),
                ...(cleanedFilterCustomAttribute.length
                    ? {
                            custom_attribute_ids: cleanedFilterCustomAttribute.map(attr => attr.custom_attribute_id).join(','),
                            custom_attribute_values: cleanedFilterCustomAttribute.map(attr => attr.value).join(','),
                        }
                    : {}
                ),
            },
        })
        if (data.success) {
            successToast({ description: 'Certificate successfully sent' })
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to send certificate' })
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
