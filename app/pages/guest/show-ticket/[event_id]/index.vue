<script setup lang="ts">
import { FetchError } from 'ofetch'

const { $api } = useNuxtApp()
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
    await loadTicket(selectedParticipant.value?.ticket_path || '', selectedParticipant.value.participant_id || 0, true)
}

async function loadTicket(filepath: string, pId: number, reload: boolean) {
    if (!import.meta.client) {
        return
    }
    else if (!filepath) {
        openFailedDialog('Invalid ticket filepath')
        return
    }

    ticketDialog.value = true
    ticketLoading.value = true
    try {
        const blob = await $api<Blob>(`/api/${filepath}`, {
            responseType: 'blob',
        })
        ticketBlob.value = blob
        ticketUrl.value = URL.createObjectURL(blob)
    }
    catch (error) {
        if (error instanceof FetchError && error.response?.status === 404 && pId && reload) {
            console.log('ticket not found, reloading once')
            await reloadTicket(filepath, pId)
        }
        else {
            ticketError.value = true
        }
    }
    finally {
        ticketLoading.value = false
    }
}

async function reloadTicket(filepath: string, pId: number) {
    if (!import.meta.client) {
        return
    }
    else if (!filepath) {
        openFailedDialog('Invalid url')
        return
    }
    else if (!pId) {
        openFailedDialog('Can not reload ticket, please contact admin')
        return
    }

    try {
        await $api(`/api/public/event/${id}/participant/${pId}/invitation/print`, {
            method: 'POST',
        })
        await loadTicket(filepath, pId, false)
    }
    catch {
        ticketError.value = true
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
                            class="portrait:h-200 landscape:max-2xl:h-125 max-h-200 w-full"
                        />

                        <NuxtImg
                            v-else-if="ticketUrl"
                            :src="ticketUrl"
                            class="portrait:max-h-200 landscape:max-2xl:max-h-125 max-h-200 object-contain rounded"
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
