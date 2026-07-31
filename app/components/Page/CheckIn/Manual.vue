<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { FetchError } from 'ofetch'

const props = defineProps<{
    eventId: number
    tenantId?: number
    title?: string
    buttonLabel?: string
    isPreview?: boolean
    isPublic?: boolean
}>()
const emit = defineEmits([EMIT_MODAL_SELECT])

const { $api } = useNuxtApp()
const latestPhoneNumber = ref('')
const state = reactive({ phoneNumber: '' })
const errorMessage = ref('')
const phoneNumberLoading = ref(false)
const failedDialog = ref(false)
const participantDialog = ref(false)
const participants = ref<TenantEventTicket[]>([])
type Schema = typeof state

function openFailedDialog(msg: string) {
    if (props.isPreview) return

    errorMessage.value = msg
    failedDialog.value = true
}

function validatePhoneNumber(state: Partial<Schema>): FormError[] {
    const errors: FormError[] = []

    if (props.isPreview) return errors

    if (!state.phoneNumber) errors.push({ name: 'phone_number', message: 'Phone number is required' })
    return errors
}

function clearPhoneNumber() {
    if (props.isPreview) return

    state.phoneNumber = ''
    latestPhoneNumber.value = ''
    participants.value = []
}

async function publicPhoneNumber(phoneNumber: string): Promise<TenantEventTicketListResult> {
    return await $api<TenantEventTicketListResult>(`/api/public/event/${props.eventId}/ticket`, {
        query: {
            page: 1,
            limit: 10,
            phone_number: phoneNumber,
        },
    })
}

async function privatePhoneNumber(phoneNumber: string): Promise<TenantEventTicketListResult> {
    return await $api<TenantEventTicketListResult>(`/api/tenant/${props.tenantId}/event/${props.eventId}/ticket`, {
        query: {
            page: 1,
            limit: 10,
            query: phoneNumber,
        },
    })
}

async function submitPhoneNumber(event: FormSubmitEvent<Schema>) {
    if (props.isPreview) return

    if (latestPhoneNumber.value !== '' && event.data.phoneNumber === latestPhoneNumber.value) {
        participantDialog.value = true
        return
    }

    phoneNumberLoading.value = true
    try {
        let res: TenantEventTicketListResult
        if (props.isPublic) {
            res = await publicPhoneNumber(event.data.phoneNumber)
        }
        else {
            res = await privatePhoneNumber(event.data.phoneNumber)
        }

        if (!res.data.ticket.length) {
            openFailedDialog('No Participant Found')
            return
        }
        participants.value = cloneObject(res.data.ticket)
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

function selectParticipant(pId: number) {
    if (props.isPreview) return

    if (!pId) return

    const participant = participants.value.find(p => p.ticket_id === pId)
    emit(EMIT_MODAL_SELECT, participant)
    participantDialog.value = false
    clearPhoneNumber()
}
</script>

<template>
    <div>
        <MiscLoadingOverlay :loading="phoneNumberLoading">
            <UCard class="w-max">
                <template #header>
                    <div>
                        <h2 class="text-highlighted font-semibold">
                            {{ title ?? 'Find Participant By Phone Number' }}
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
                        {{ buttonLabel ?? 'Find Participant' }}
                    </button>
                </UForm>
            </UCard>
        </MiscLoadingOverlay>

        <ModalParticipantList
            v-model:open="participantDialog"
            :participants="participants"
            @select="selectParticipant"
        />

        <ModalCheckInFailed
            v-model:open="failedDialog"
            :message="errorMessage"
        />
    </div>
</template>
