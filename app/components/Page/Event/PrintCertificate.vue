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
const printConfirmation = defineModel<boolean>('open', { default: false })

const { $api } = useNuxtApp()
const { errorToast } = useErrorToast()
const printLoading = ref(false)

async function printQr() {
    const ids = props.selectedIds.length > 0 ? props.selectedIds : []
    try {
        printLoading.value = true
        const cleanedFilterCustomAttribute = formatCleanCustomAttribute(props.filterCustomAttribute)
        const { data } = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/ticket/print`, {
            method: 'POST',
            body: {
                document_type: 'certificate',
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
        if (data.url) {
            downloadFileUrl(data.url)
            /*
            const filename = data.filepath.split('/').pop()
            if (!filename) {
                errorToast({ description: 'Cannot read filename from filepath' })
                return
            }
            await useDownload(
                `/api/files/${data.filepath}`,
                filename,
            )
            */
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
        icon="lucide:scroll-text"
        class="cursor-pointer"
        @click="printConfirmation = true"
    >
        {{ `Print Certificate ${selectedIds.length ? `(${selectedIds.length})` : ''}` }}
    </UButton>

    <ModalConfirmNeutralAction
        v-model:open="printConfirmation"
        title="Print Certificate Confirmation"
        :body="`You will print ${selectedIds.length || 'All'} certificate of participants, Continue?`"
        confirm-label="Yes, Print Certificate"
        :loading="printLoading"
        @confirm="printQr"
    />
</template>
