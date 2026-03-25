<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { FetchError } from 'ofetch'

const { $api } = useNuxtApp()
const route = useRoute()
const id = Number(route.params.event_id)
const latestPhoneNumber = ref('')
const state = reactive({ phoneNumber: '' })
const errorMessage = ref('')
const failedDialog = ref(false)
const participantDialog = ref(false)
const participants = ref<Participant[]>([])
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
}

function previewTicket(url: string) {
    if (url) {
        window.open(url, '_blank')
        participantDialog.value = false
    }
    else {
        openFailedDialog('Invalid url')
    }
}

definePageMeta({
    layout: 'check-in',
    middleware: ['check-in'],
})
</script>

<template>
    <div>
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
                    class="cursor-pointer bg-primary text-white text-2xl font-semibold py-4 px-6 rounded-xl"
                >
                    Generate Ticket
                </button>
            </UForm>
        </UCard>

        <UModal
            v-model:open="participantDialog"
            :dismissible="false"
        >
            <template #content>
                <div class="flex flex-col justify-center p-12">
                    <div class="mb-6">
                        <h2>
                            Please select correct data below:
                        </h2>
                    </div>

                    <UCard
                        v-for="participant in participants"
                        :key="participant.participant_id"
                        class="cursor-pointer mb-6"
                        :ui="{ root: 'hover:ring hover:ring-primary' }"
                        @click="() => previewTicket(participant.ticket_url || '')"
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

        <ModalCheckInFailed
            v-model:open="failedDialog"
            :message="errorMessage"
        />
    </div>
</template>
