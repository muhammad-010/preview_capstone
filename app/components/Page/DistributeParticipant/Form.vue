<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
const props = defineProps<{
    tenantId: number
    isModal?: boolean
}>()
const loading = defineModel<boolean>('loading', { default: false })
const success = defineModel<boolean>('success', { default: false })
const submitDisabled = defineModel<boolean>('submit-disabled', { default: true })
const formRef = useTemplateRef<Form<TenantForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}
defineExpose({ saveData })

const schema = z.object({
    event_id: zodNumberRequired('Event is required'),
    raw_document_type: zodStringRequired('Document Type is required'),
    channel: zodStringRequired('Channel is required'),

    document_type: zodNumberOptional(),
})
type Schema = z.output<typeof schema>

const state = reactive<{
    event_id?: number
    raw_document_type: string
    channel?: DistributeChannel

    document_type: number
}>({
    event_id: undefined,
    raw_document_type: '1',
    channel: DISTRIBUTE_CHANNEL_EMAIL,

    document_type: 0,
})

const documentTypes = computed(() => [
    ...Object.entries(DISTRIBUTE_TYPE_ENUM)
        .filter(([key]) => key !== DISTRIBUTE_TYPE_INVOICE)
        .map(([key, value]) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: String(value),
        })),
])
const channels = computed(() => {
    let res = []
    if (!state.raw_document_type || state.raw_document_type === String(DISTRIBUTE_TYPE_ENUM[DISTRIBUTE_TYPE_INVITATION])) {
        res = DISTRIBUTE_CHANNEL_DROPDOWN.map(e => ({
            label: e.toUpperCase(),
            value: e,
        }))
    }
    else {
        res = DISTRIBUTE_CHANNEL_DROPDOWN.filter(e => e === DISTRIBUTE_CHANNEL_EMAIL).map(e => ({
            label: e.toUpperCase(),
            value: e,
        }))
    }
    return res
})
const checkInStatuses = computed(() => [
    ...TICKET_SESSION_STATUS_DROPDOWN.map(e => ({
        label: formatCapitalize(e),
        value: e,
    })),
])
const targetStatuses = computed(() => [
    ...DISTRIBUTE_STATUS_DROPDOWN.filter(e => e !== DISTRIBUTE_STATUS_IN_QUEUE && e !== DISTRIBUTE_STATUS_SENT)
        .map(e => ({
            label: formatCapitalize(e.replaceAll('_', ' ')),
            value: e,
        })),
])

const filterTargetCheckInStatus = ref<TenantEventTicketSessionStatus | undefined>()
const filterTargetStatus = ref<DistributeStatus | undefined>()
const page = ref(1)
const limit = ref(5)

const { data, pending, execute } = await useLazyApi(
    () => `/api/tenant/${props.tenantId}/event/${state.event_id}/ticket`,
    {
        transform: res => res.data,
        query: computed(() => {
            const docType = Object.entries(DISTRIBUTE_TYPE_ENUM).find(([, value]) => value === Number(state.raw_document_type))?.[0]
            const channel = docType === DISTRIBUTE_TYPE_CERTIFICATE ? DISTRIBUTE_CHANNEL_EMAIL : state.channel

            return {
                page: page.value,
                limit: limit.value,
                notification_channel: channel,
                notification_type: `event-${docType}`,
                ...(filterTargetCheckInStatus.value ? { check_in_session: filterTargetCheckInStatus.value } : {}),
                ...(filterTargetStatus.value ? { notification_status: filterTargetStatus.value } : {}),
            }
        }),
        immediate: false,
    })
const list = computed(() => data.value?.ticket ?? [])
const total = computed(() => data.value?.total_data ?? 0)
watch(() => state.raw_document_type, (newVal) => {
    const docType = Object.entries(DISTRIBUTE_TYPE_ENUM).find(([, value]) => value === Number(newVal))?.[0]
    if (docType === DISTRIBUTE_TYPE_CERTIFICATE) {
        state.channel = DISTRIBUTE_CHANNEL_EMAIL
    }
})
watch(() => state.event_id, (newVal) => {
    if (newVal) {
        if (state.channel && state.raw_document_type) execute()
    }
    else {
        data.value = undefined
    }
})

const selectedTargets = ref([])
const selectAll = ref(false)
watch(selectedTargets, (newValue) => {
    submitDisabled.value = newValue.length === 0
}, { deep: true })

async function create(payload: FormSubmitEvent<Schema>) {
    const docType = Object.entries(DISTRIBUTE_TYPE_ENUM).find(([, value]) => value === Number(state.raw_document_type))?.[0] ?? '-'

    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event/${payload.data.event_id}/ticket/send`, {
            method: 'POST',
            body: {
                channel: [payload.data.channel],
                document_type: docType,
                participant_ids: selectedTargets.value,
            },
        })
        if (data.success) {
            successToast({ description: `${formatCapitalize(docType)} successfully sent` })
            success.value = true
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: `Failed to send ${docType}` })
    }
}

async function submitData(payload: FormSubmitEvent<Schema>) {
    loading.value = true
    await create(payload)
}
</script>

<template>
    <UForm
        ref="formRef"
        :schema="schema"
        :state="state"
        @submit.prevent="submitData"
    >
        <div
            class="grid gap-6 mb-4"
            :class="isModal ? '' : 'md:grid-cols-3'"
        >
            <UFormField
                label="Document Type"
                name="raw_document_type"
                required
                readonly
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInputMenu
                    v-model="state.raw_document_type"
                    :disabled="!state.event_id"
                    :items="documentTypes"
                    value-key="value"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Channel"
                name="channel"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInputMenu
                    v-model="state.channel"
                    :disabled="!state.event_id || !state.raw_document_type"
                    :items="channels"
                    value-key="value"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Event"
                name="event_id"
                required
                readonly
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <InputSelectMenuEventLazy
                    v-model="state.event_id"
                    :tenant-id="tenantId"
                />
            </UFormField>
        </div>

        <div class="flex flex-col gap-4 border-t border-default pt-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-6">
                    <UFormField label="Filter Check-In Status">
                        <UInputMenu
                            v-model="filterTargetCheckInStatus"
                            :items="checkInStatuses"
                            value-key="value"
                            class="w-full"
                            placeholder="Check-in status unfiltered"
                        />
                    </UFormField>

                    <UFormField
                        label="Status"
                    >
                        <UInputMenu
                            v-model="filterTargetStatus"
                            :items="targetStatuses"
                            value-key="value"
                            class="w-full"
                            placeholder="Status unfiltered"
                        />
                    </UFormField>
                </div>
            </div>

            <PageDistributeParticipantTableForm
                v-model:limit="limit"
                v-model:page="page"
                v-model:selected="selectedTargets"
                v-model:select-all="selectAll"
                :tenant-id="tenantId"
                :data="list"
                :total="total"
                :pending="pending"
                with-pagination
            />
        </div>
    </UForm>
</template>
