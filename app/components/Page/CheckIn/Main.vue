<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { DetectedBarcode } from 'nuxt-qrcode'

const props = defineProps<{
    tenantId: number
    eventId: number
    sessionId?: number
    isPreview?: boolean
    customBlockSettings?: ElementBlock[]
    staticBlockSettings?: ElementBlock[]
}>()
const checkInSuccessDialog = defineModel<boolean>('open-success', { default: false })
const checkInFailedDialog = defineModel<boolean>('open-failed', { default: false })
const participant = defineModel<ParticipantCheckInTarget>('participant', { default: () => ({
    id: 0,
    sessionId: 0,
    sessionName: '',
    name: '',
    maxAttendance: 0,
    customAttributes: [],
}),
})
const errorMessage = defineModel<string>('error-message', { default: '' })
const emit = defineEmits([EMIT_CHECK_IN_SUCCESS, EMIT_CHECK_IN_FAILED])

const { $api } = useNuxtApp()
const { errorToast } = useErrorToast()
const isClient = import.meta.client

// CHECK IN METHOD
const checkInMethodDialog = ref(true)
const activeCheckInMethod = ref<CheckInMethod | null>(null)
const inverseCheckInMethodLabel = computed(() => {
    switch (activeCheckInMethod.value) {
        case CHECK_IN_METHOD_SCAN:
            return `Switch to ${CHECK_IN_METHODS[CHECK_IN_METHOD_MANUAL]}`
        case CHECK_IN_METHOD_MANUAL:
            return `Switch to ${CHECK_IN_METHODS[CHECK_IN_METHOD_SCAN]}`
        default:
            return 'No check-in method selected'
    }
})
function checkInQr() {
    activeCheckInMethod.value = CHECK_IN_METHOD_SCAN
    checkInMethodDialog.value = false
}
function checkInManual() {
    activeCheckInMethod.value = CHECK_IN_METHOD_MANUAL
    checkInMethodDialog.value = false
}
function switchCheckInMethod() {
    switch (activeCheckInMethod.value) {
        case CHECK_IN_METHOD_SCAN:
            activeCheckInMethod.value = CHECK_IN_METHOD_MANUAL
            break
        case CHECK_IN_METHOD_MANUAL:
            activeCheckInMethod.value = CHECK_IN_METHOD_SCAN
            break
        default:
            break
    }
}

// DIALOG
const confirmAttendanceDialog = ref(false)
function openCheckInSuccess() {
    if (props.isPreview) return

    confirmAttendanceDialog.value = false
    checkInSuccessDialog.value = true
    playSuccessSound()
    emit(EMIT_CHECK_IN_SUCCESS)
    setTimeout(() => {
        checkInSuccessDialog.value = false
    }, 5000)
}
function openCheckInFailed(msg: string) {
    if (props.isPreview) return

    errorMessage.value = msg
    checkInFailedDialog.value = true
    playErrorSound()
    emit(EMIT_CHECK_IN_FAILED)
    setTimeout(() => {
        checkInFailedDialog.value = false
    }, 5000)
}

// AUDIO
let checkinAudio: HTMLAudioElement
let successAudio: HTMLAudioElement
let errorAudio: HTMLAudioElement
onMounted(() => {
    window.addEventListener('pointerdown', () => {
        checkinAudio = new Audio('/checkin-sound.mp3')
        successAudio = new Audio('/success-sound.mp3')
        errorAudio = new Audio('/error-sound.mp3')
        Promise.all([
            checkinAudio.play().then(() => {
                checkinAudio.pause()
                checkinAudio.currentTime = 0
            }),
            successAudio.play().then(() => {
                successAudio.pause()
                successAudio.currentTime = 0
            }),
            errorAudio.play().then(() => {
                errorAudio.pause()
                errorAudio.currentTime = 0
            }),
        ])
    }, { once: true })
})
function playCheckinSound() {
    if (props.isPreview) return

    if (isClient && checkinAudio) checkinAudio.play()
}
function playSuccessSound() {
    if (props.isPreview) return

    if (isClient && successAudio) successAudio.play()
}
function playErrorSound() {
    if (props.isPreview) return

    if (isClient && errorAudio) errorAudio.play()
}
function openConfirmAttendanceDialog() {
    if (props.isPreview) return

    confirmAttendanceDialog.value = true
    playCheckinSound()
}

// TARGET DATA
const participantQr = ref('')

function resetRef() {
    if (props.isPreview) return

    confirmAttendanceDialog.value = false
    checkInSuccessDialog.value = false
    checkInFailedDialog.value = false
    setTimeout(() => {
        participantQr.value = ''
        errorMessage.value = ''
    }, 500)
}

watch([checkInSuccessDialog, checkInFailedDialog], ([successDialog, failedDialog], [oldSuccessDialog, oldFailedDialog]) => {
    const successClosed = oldSuccessDialog && !successDialog
    const failedClosed = oldFailedDialog && !failedDialog

    if (successClosed) {
        participant.value = {
            id: 0,
            sessionId: 0,
            sessionName: '',
            name: '',
            maxAttendance: 0,
            customAttributes: [],
        }
    }
    if (successClosed || failedClosed) {
        resetRef()
    }
})

// SCAN QR
const pauseQr = ref(false)
async function qrDetected(qrCodes: DetectedBarcode[]) {
    if (props.isPreview || !props.sessionId) return

    if (qrCodes.length <= 0) {
        errorToast({ description: 'No QR read' })
        return
    }
    const qrCode = qrCodes[0]
    if (!qrCode || !qrCode.rawValue) {
        errorToast({ description: 'Invalid QR code' })
        return
    }
    participantQr.value = qrCode.rawValue

    try {
        const { data } = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/session/${props.sessionId}/check-in`, {
            method: 'POST',
            body: {
                token: participantQr.value,
            },
        })
        participant.value = {
            ...participant.value,
            sessionId: props.sessionId,
            name: data.participant.name || '',
            maxAttendance: data.participant.max_attendance || 0,
            customAttributes: data.participant.custom_attributes || [],
        }
        if (data.confirmation_attendance) {
            openConfirmAttendanceDialog()
        }
        else {
            openCheckInSuccess()
        }
    }
    catch (error) {
        const description = errorToast({
            error,
            description: 'Failed submitting QR',
            skipToast: true,
        })
        openCheckInFailed(description)
    }
    finally {
        setTimeout(() => {
            pauseQr.value = false
        }, 500)
    }
}

// MANUAL CHECK IN
async function selectParticipant(selectedParticipant: Participant | undefined) {
    if (props.isPreview) return

    if (!selectedParticipant) return

    participant.value = {
        ...participant.value,
        id: selectedParticipant.participant_id || 0,
        name: selectedParticipant.name,
    }
    await manualCheckIn()
}

async function manualCheckIn() {
    if (props.isPreview || !props.sessionId) return

    if (!participant.value.id) return

    try {
        const { data } = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/session/${props.sessionId}/check-in/manual`, {
            method: 'POST',
            body: {
                participant_id: participant.value.id,
            },
        })
        participant.value = {
            ...participant.value,
            maxAttendance: data.participant.max_attendance || 0,
            customAttributes: data.participant.custom_attributes || [],
        }
        if (data.confirmation_attendance) {
            openConfirmAttendanceDialog()
        }
        else {
            openCheckInSuccess()
        }
    }
    catch (error) {
        const description = errorToast({
            error,
            description: 'Failed to manually check in participant',
            skipToast: true,
        })
        openCheckInFailed(description)
    }
}

// CONFIRM ATTENDANCE
const confirmAttendanceState = reactive({ count: 0 })
type ConfirmAttendanceSchema = typeof confirmAttendanceState
function validateConfirmAttendance(state: Partial<ConfirmAttendanceSchema>): FormError[] {
    const errors: FormError[] = []

    if (props.isPreview) return errors

    if (!state.count) errors.push({ name: 'count', message: 'Guest count is required, minimum is 1' })
    else if (state.count > participant.value.maxAttendance) errors.push({ name: 'count', message: `Can not more than ${participant.value.maxAttendance}` })
    return errors
}

async function confirmAttendanceQr(event: FormSubmitEvent<ConfirmAttendanceSchema>) {
    if (props.isPreview || !props.sessionId) return

    try {
        await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/session/${props.sessionId}/check-in/confirm`, {
            method: 'POST',
            body: {
                token: participantQr.value,
                count_attendance: Number(event.data.count),
            },
        })
        openCheckInSuccess()
    }
    catch (error) {
        const description = errorToast({
            error,
            description: 'Failed to confirming check-in',
            skipToast: true,
        })
        openCheckInFailed(description)
    }
}

async function confirmAttendanceManual(event: FormSubmitEvent<ConfirmAttendanceSchema>) {
    if (props.isPreview || !props.sessionId) return

    try {
        await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/session/${props.sessionId}/check-in/confirm/manual`, {
            method: 'POST',
            body: {
                participant_id: participant.value.id,
                count_attendance: Number(event.data.count),
            },
        })
        openCheckInSuccess()
    }
    catch (error) {
        const description = errorToast({
            error,
            description: 'Failed to manually confirming check-in',
            skipToast: true,
        })
        openCheckInFailed(description)
    }
}

async function confirmAttendance(event: FormSubmitEvent<ConfirmAttendanceSchema>) {
    switch (activeCheckInMethod.value) {
        case CHECK_IN_METHOD_SCAN:
            confirmAttendanceQr(event)
            break
        case CHECK_IN_METHOD_MANUAL:
            confirmAttendanceManual(event)
            break
        default:
            break
    }
}

const checkInResponsivePos = computed(() => {
    const block = props.staticBlockSettings?.find(b => b.id === STATIC_BLOCK_SCANNER_QR_ID)
    return block ? getResponsivePositionStyle(block) : { style: {}, tailwindClass: [] }
})
const inputCardResponsivePos = computed(() => {
    const block = props.staticBlockSettings?.find(b => b.id === STATIC_BLOCK_INPUT_CARD_ID)
    return block ? getResponsivePositionStyle(block) : { style: {}, tailwindClass: [] }
})
</script>

<template>
    <div class="max-w-[60vw]">
        <MiscBlockLoader
            :block-settings="props.customBlockSettings || []"
        />

        <div
            v-if="activeCheckInMethod === CHECK_IN_METHOD_SCAN"
            :style="checkInResponsivePos.style"
            :class="checkInResponsivePos.tailwindClass"
        >
            <div class="flex justify-center mb-4">
                <UButton
                    color="neutral"
                    :label="inverseCheckInMethodLabel"
                    @click="switchCheckInMethod"
                />
            </div>

            <PageCheckInScan
                v-model:pause-qr="pauseQr"
                :is-preview="isPreview"
                @qr-detect="qrDetected"
            />
        </div>

        <div
            v-else-if="activeCheckInMethod === CHECK_IN_METHOD_MANUAL"
            :style="inputCardResponsivePos.style"
            :class="inputCardResponsivePos.tailwindClass"
        >
            <div class="flex justify-center mb-4">
                <UButton
                    color="neutral"
                    :label="inverseCheckInMethodLabel"
                    @click="switchCheckInMethod"
                />
            </div>

            <PageCheckInManual
                :event-id="eventId"
                :tenant-id="tenantId"
                title="Manual Check In"
                button-label="Check In"
                :is-preview="isPreview"
                @select="selectParticipant"
            />
        </div>

        <UModal
            v-model:open="confirmAttendanceDialog"
            :dismissible="false"
        >
            <template #header>
                <div>
                    <h2 class="text-highlighted font-semibold">
                        Confirm Attendance
                    </h2>
                </div>
            </template>
            <template #body>
                <div class="flex flex-col p-4">
                    <div class="text-center mb-8">
                        <div class="text-2xl">
                            Please confirm guests attendance for {{ participant.name }}
                        </div>
                        <div class="text-xl">
                            (Max {{ participant.maxAttendance }})
                        </div>
                    </div>

                    <UForm
                        :validate="validateConfirmAttendance"
                        :state="confirmAttendanceState"
                        class="flex flex-col items-center"
                        @submit="confirmAttendance"
                    >
                        <UFormField
                            label="Number of guests"
                            name="count"
                            required
                            class="text-lg mb-8"
                        >
                            <UInput
                                v-model="confirmAttendanceState.count"
                                :ui="{
                                    base: 'px-4 py-4 text-5xl text-center gap-2',
                                    leading: 'ps-4',
                                    trailing: 'pe-4',
                                }"
                            >
                                <template #leading>
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        icon="lucide:minus"
                                        size="xl"
                                        :disabled="confirmAttendanceState.count === 0"
                                        @click="confirmAttendanceState.count--"
                                    />
                                </template>
                                <template #trailing>
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        icon="lucide:plus"
                                        size="xl"
                                        :disabled="confirmAttendanceState.count === participant.maxAttendance"
                                        @click="confirmAttendanceState.count++"
                                    />
                                </template>
                            </UInput>
                        </UFormField>
                        <button
                            type="submit"
                            class="cursor-pointer bg-primary text-white text-2xl font-semibold py-4 px-6 rounded-xl"
                        >
                            Check In
                        </button>
                    </UForm>
                </div>
            </template>
        </UModal>

        <UModal
            v-model:open="checkInMethodDialog"
            :dismissible="false"
        >
            <template #content>
                <div class="flex flex-col gap-6 p-6">
                    <div>
                        <h2>Please select check-in method</h2>
                    </div>

                    <button
                        class="cursor-pointer bg-success text-white text-2xl font-semibold py-4 px-6 rounded-xl"
                        @click="checkInQr"
                    >
                        Scan QR
                    </button>

                    <button
                        class="cursor-pointer bg-primary text-white text-2xl font-semibold py-4 px-6 rounded-xl"
                        @click="checkInManual"
                    >
                        Input Phone Number
                    </button>
                </div>
            </template>
        </UModal>
    </div>
</template>
