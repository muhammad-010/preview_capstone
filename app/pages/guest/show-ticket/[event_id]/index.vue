<script setup lang="ts">
import type { Participant } from '~~/shared/types/data'

const route = useRoute()
const id = Number(route.params.event_id)
const errorMessage = ref('')
const failedDialog = ref(false)
const selectedParticipant = ref<Participant | undefined | null>(null)
const ticketLoading = ref(false)
const ticketBlob = ref<Blob | null>(null)
const ticketUrl = ref<string | null>(null)
const ticketDialog = ref(false)
const ticketError = ref(false)

function openFailedDialog(msg: string) {
    errorMessage.value = msg
    failedDialog.value = true
}

async function selectParticipant(participant: Participant | undefined) {
    if (!participant) return

    selectedParticipant.value = participant
    await loadTicket(selectedParticipant.value?.ticket_url || '')
}

async function loadTicket(url: string) {
    if (!import.meta.client) {
        return
    }
    else if (!url) {
        openFailedDialog('Invalid url')
        return
    }

    ticketDialog.value = true
    ticketLoading.value = true
    try {
        const blob = await $fetch<Blob>(url, {
            responseType: 'blob',
        })
        ticketBlob.value = blob
        ticketUrl.value = URL.createObjectURL(blob)
    }
    catch {
        ticketError.value = true
    }
    finally {
        ticketLoading.value = false
    }
}

function downloadTicket() {
    if (!ticketUrl.value || !import.meta.client) return

    const a = document.createElement('a')
    a.href = ticketUrl.value
    a.download = `${selectedParticipant.value?.name || ''}'s Ticket`
    a.click()
    a.remove()
}

function closeTicketPreview(close: () => void) {
    close()
    setTimeout(() => {
        selectedParticipant.value = null
        ticketError.value = false
        if (ticketUrl.value) URL.revokeObjectURL(ticketUrl.value)
        ticketBlob.value = null
        ticketUrl.value = null
    }, 500)
}

useHead({
    title: 'Rawooh - Generate Ticket',
})
definePageMeta({
    layout: 'check-in',
    middleware: ['check-in'],
})
</script>

<template>
    <div>
        <CheckInManual
            :event-id="id"
            title="Generate Ticket By Phone Number"
            button-label="Show Ticket"
            @select="selectParticipant"
        />

        <UModal
            v-model:open="ticketDialog"
            :dismissible="false"
        >
            <template #content="{ close }">
                <div class="flex flex-col items-center gap-6 px-12 py-6">
                    <div>
                        <h2>Download {{ selectedParticipant?.name || '' }}'s Ticket</h2>
                    </div>
                    <div class="w-full flex justify-center items-center min-h-125">
                        <USkeleton
                            v-if="ticketLoading"
                            class="h-175 w-full"
                        />

                        <NuxtImg
                            v-else-if="ticketUrl"
                            :src="ticketUrl"
                            class="max-h-175 object-contain rounded"
                        />

                        <div
                            v-else
                            class="flex flex-col items-center text-dimmed"
                        >
                            <UIcon
                                name="lucide:image-off"
                                class="text-6xl"
                            />
                            <p class="text-sm mt-2">
                                Image not found
                            </p>
                        </div>
                    </div>

                    <div class="flex gap-4">
                        <UButton
                            color="neutral"
                            variant="outline"
                            icon="lucide:x"
                            size="xl"
                            @click="() => closeTicketPreview(close)"
                        >
                            Close
                        </UButton>

                        <UButton
                            icon="lucide:download"
                            size="xl"
                            :disabled="!ticketBlob || !ticketUrl"
                            @click="downloadTicket"
                        >
                            Download
                        </UButton>
                    </div>
                </div>
            </template>
        </UModal>

        <ModalCheckInFailed
            v-model:open="failedDialog"
            :message="errorMessage"
        />
    </div>
</template>
