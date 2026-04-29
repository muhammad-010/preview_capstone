<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    eventId: number
    hide?: boolean
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])
const importDialog = defineModel<boolean>('open', { default: false })

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
const downloadLoading = ref(false)
const uploadLoading = ref(false)
const uploadFile = ref<File | null>(null)

function closeImportDialog() {
    importDialog.value = false
    uploadFile.value = null
}

async function downloadTemplate() {
    try {
        downloadLoading.value = true
        await useDownload(
            `/api/files/${FILE_IMPORT_PARTICIPANT}`,
            FILE_IMPORT_PARTICIPANT,
        )
    }
    catch (error) {
        errorToast({ error, description: 'Failed to download template' })
    }
    finally {
        downloadLoading.value = false
    }
}

async function uploadTemplate() {
    if (!uploadFile.value) return

    const body = new FormData()
    body.append('file', uploadFile.value)
    try {
        uploadLoading.value = true
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/participant/bulk`, {
            method: 'POST',
            body,
        })
        if (data.success) {
            successToast({ description: 'Participants successfully uploaded' })
            closeImportDialog()
            emit(EMIT_DETAIL_REFRESH)
        }
        else {
            successToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to upload participants' })
    }
    finally {
        uploadLoading.value = false
    }
}
</script>

<template>
    <UButton
        v-if="!hide"
        color="neutral"
        variant="outline"
        icon="lucide:upload"
        class="cursor-pointer"
        @click="importDialog = true"
    >
        Import
    </UButton>

    <UModal v-model:open="importDialog">
        <template #header="{ close }">
            <div class="flex justify-between items-center w-full">
                <h5>Import Attendee</h5>

                <UButton
                    color="neutral"
                    variant="ghost"
                    icon="lucide:x"
                    @click="close"
                />
            </div>
        </template>

        <template #body>
            <MiscLoadingOverlay :loading="downloadLoading">
                <UCard
                    :ui="{
                        root: 'bg-neutral-50 dark:bg-neutral-800',
                    }"
                    class="mb-4"
                >
                    <div class="flex gap-4">
                        <UIcon
                            name="lucide:file-spreadsheet"
                            class="size-8"
                        />
                        <div>
                            <div class="mb-2">
                                <h5>Download Template</h5>
                                <small>Use our CSV template to ensure your data is formatted correctly</small>
                            </div>
                            <UButton
                                icon="lucide:download"
                                label="Download Template"
                                @click="downloadTemplate"
                            />
                        </div>
                    </div>
                </UCard>
            </MiscLoadingOverlay>

            <MiscLoadingOverlay :loading="uploadLoading">
                <UFileUpload
                    v-model="uploadFile"
                    icon="lucide:file-spreadsheet"
                    variant="area"
                    layout="list"
                    position="inside"
                    label="Click to upload or Drop your files here"
                    description="XLSX only"
                    class="cursor-pointer"
                    highlight
                    :accept="FILE_EXT_XLSX"
                />
            </MiscLoadingOverlay>
        </template>

        <template #footer>
            <div class="flex justify-end items-center w-full">
                <div class="flex gap-2">
                    <UButton
                        color="neutral"
                        variant="outline"
                        icon="lucide:x"
                        class="cursor-pointer"
                        label="Cancel"
                        :disabled="downloadLoading || uploadLoading"
                        @click="closeImportDialog"
                    />
                    <UButton
                        color="primary"
                        icon="lucide:save"
                        class="cursor-pointer"
                        label="Upload"
                        :disabled="downloadLoading || uploadLoading"
                        @click="uploadTemplate"
                    />
                </div>
            </div>
        </template>
    </UModal>
</template>
