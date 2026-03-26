<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { FetchError } from 'ofetch'

const { $api } = useNuxtApp()
const route = useRoute()
const id = Number(route.params.event_id)
const latestPhoneNumber = ref('')
const state = reactive({ phoneNumber: '' })
const errorMessage = ref('')
const phoneNumberLoading = ref(false)
const failedDialog = ref(false)
const participantDialog = ref(false)
const participants = ref<Participant[]>([])
const selectedParticipantId = ref(0)
const selectedParticipant = computed(() => participants.value.filter(p => p.participant_id === selectedParticipantId.value)[0] || null)
const ticketLoading = ref(false)
const ticketBlob = ref<Blob | null>(null)
const ticketUrl = ref<string | null>(null)
const ticketDialog = ref(false)
const ticketError = ref(false)
type Schema = typeof state

function openFailedDialog(msg: string) {
    errorMessage.value = msg
    failedDialog.value = true
}

function validatePhoneNumber(state: Partial<Schema>): FormError[] {
    const errors = []
    if (!state.phoneNumber) errors.push({ name: 'phone_number', message: 'Phone number is required' })
    return errors
}

function clearPhoneNumber() {
    state.phoneNumber = ''
    latestPhoneNumber.value = ''
    participants.value = []
}

async function submitPhoneNumber(event: FormSubmitEvent<Schema>) {
    if (latestPhoneNumber.value !== '' && event.data.phoneNumber === latestPhoneNumber.value) {
        participantDialog.value = true
        return
    }

    phoneNumberLoading.value = true
    try {
        const res = await $api(`/api/public/event/${id}/participant`, {
            query: {
                page: 1,
                limit: 10,
                phone_number: event.data.phoneNumber,
            },
        })
        if (!res.data.participant.length) {
            openFailedDialog('No Participant Found')
            return
        }
        participants.value = structuredClone(res.data.participant)
        participantDialog.value = true
        latestPhoneNumber.value = event.data.phoneNumber
    }
    catch (error) {
        if (error instanceof FetchError && error.response) {
            openFailedDialog(error.response._data.data.message)
        }
    }
    finally {
        phoneNumberLoading.value = false
    }
}

async function selectParticipant(pId: number) {
    if (!pId) return

    selectedParticipantId.value = pId
    participantDialog.value = false
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
        selectedParticipantId.value = 0
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
        <MiscLoadingOverlay :loading="phoneNumberLoading">
            <UCard>
                <template #header>
                    <div>
                        <h2 class="text-highlighted font-semibold">
                            Generate Ticket By Phone Number
                        </h2>
                    </div>
                </template>

                <UForm
                    :validate="validatePhoneNumber"
                    :state="state"
                    class="flex flex-col items-center"
                    @submit="submitPhoneNumber"
                >
                    <UFormField
                        label="Phone Number"
                        name="phone_number"
                        required
                        class="text-lg mb-8"
                    >
                        <UInput
                            v-model="state.phoneNumber"
                            :ui="{
                                base: 'px-4 py-4 text-5xl gap-2',
                            }"
                        >
                            <template #trailing>
                                <UButton
                                    v-if="state.phoneNumber"
                                    color="neutral"
                                    variant="link"
                                    size="xl"
                                    icon="lucide:x"
                                    @click="clearPhoneNumber"
                                />
                            </template>
                        </UInput>
                    </UFormField>
                    <button
                        type="submit"
                        :disabled="phoneNumberLoading"
                        class="cursor-pointer bg-primary text-white text-2xl font-semibold py-4 px-6 rounded-xl"
                    >
                        Show Ticket
                    </button>
                </UForm>
            </UCard>
        </MiscLoadingOverlay>

        <UModal
            v-model:open="participantDialog"
            :dismissible="false"
            title="Please select correct data below"
        >
            <template #body>
                <div class="flex flex-col justify-center px-12">
                    <UCard
                        v-for="participant in participants"
                        :key="participant.participant_id"
                        variant="subtle"
                        class="cursor-pointer mb-6"
                        :ui="{ root: 'hover:ring hover:ring-primary' }"
                        @click="() => selectParticipant(participant.participant_id || 0)"
                    >
                        <div class="flex justify-between">
                            <div>
                                <h5>{{ participant.name }}</h5>
                                {{ participant.phone_number }}
                            </div>

                            <div>
                                <UBadge
                                    :color="PARTICIPANT_STATUS_COLORS[participant.status]"
                                    variant="subtle"
                                    :label="participant.status"
                                />
                            </div>
                        </div>
                    </UCard>
                </div>
            </template>
        </UModal>

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
