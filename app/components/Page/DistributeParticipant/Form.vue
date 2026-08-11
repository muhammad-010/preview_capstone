<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

interface DistributeTarget {
    ticket_id: number
    name: string
    email: string
    phone_number: string
    check_in_status: TenantEventTicketSessionStatus
    is_sent: boolean
}

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
defineProps<{
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
    raw_event_id: zodStringRequired('Event is required'),
    raw_document_type: zodStringRequired('Document Type is required'),
    channel: zodStringRequired('Channel is required'),

    event_id: zodNumberOptional(),
    document_type: zodNumberOptional(),
})
type Schema = z.output<typeof schema>

const state = reactive({
    raw_event_id: '',
    raw_document_type: '1',
    channel: 'email',
    event_id: 0,
    document_type: 0,
})

const events = [
    {
        label: 'Dummy Event 1',
        value: '1',
    },
    {
        label: 'Dummy Event 2',
        value: '2',
    },
]
const documentTypes = [
    {
        label: 'Invitation',
        value: '1',
    },
    {
        label: 'Certificate',
        value: '2',
    },
]
const channels = [
    {
        label: 'EMAIL',
        value: 'email',
    },
    {
        label: 'WHATSAPP',
        value: 'whatsapp',
    },
]
const validChannels = computed(() => state.raw_document_type === '1' || !state.raw_document_type ? channels : channels.filter(e => e.value === 'email'))
const checkInStatuses = [
    {
        label: 'All',
        value: 'all',
    },
    {
        label: 'None',
        value: 'none',
    },
    {
        label: 'Partial',
        value: 'partial',
    },
    {
        label: 'Completed',
        value: 'completed',
    },
]

const filterTargetCheckInStatus = ref<string>('all')
const filterTargetNotSentOnly = ref<boolean>(false)
const targets = ref<DistributeTarget[]>([
    {
        ticket_id: 1,
        name: 'Dummy 1',
        email: 'dummy@mail.com',
        phone_number: '080880808800',
        check_in_status: 'none' as TenantEventTicketSessionStatus,
        is_sent: false,
    },
    {
        ticket_id: 2,
        name: 'Dummy 2',
        email: 'dummy@mail.com',
        phone_number: '080880808800',
        check_in_status: 'partial' as TenantEventTicketSessionStatus,
        is_sent: false,
    },
    {
        ticket_id: 3,
        name: 'Dummy 3',
        email: 'dummy@mail.com',
        phone_number: '080880808800',
        check_in_status: 'completed' as TenantEventTicketSessionStatus,
        is_sent: false,
    },
])
const targetsLimit = ref(5)
const targetsPage = ref(1)
const targetsTotal = computed(() => targets.value.length)
const targetsPending = ref(false)
const selectedTargets = ref([])
const selectAll = ref(false)
watch(selectedTargets, (newValue) => {
    submitDisabled.value = newValue.length === 0
}, { deep: true })

async function create(payload: FormSubmitEvent<Schema>) {
    try {
        const data = await $api('/api/tenant', {
            method: 'POST',
            body: {
                channel: payload.data.channel,
                document_type: Number(payload.data.raw_document_type),
            },
        })
        if (data.success) {
            successToast({ description: 'A tenant has been created' })
            success.value = true
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to create new tenant' })
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
                label="Event"
                name="raw_event_id"
                required
                readonly
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInputMenu
                    v-model="state.raw_event_id"
                    :items="events"
                    value-key="value"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Document Type"
                name="raw_document_type"
                required
                readonly
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInputMenu
                    v-model="state.raw_document_type"
                    :disabled="!state.raw_event_id"
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
                    :disabled="!state.raw_event_id || !state.raw_document_type"
                    :items="validChannels"
                    value-key="value"
                    class="w-full"
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
                        />
                    </UFormField>

                    <UFormField
                        label="Last Sent"
                    >
                        <USwitch
                            v-model="filterTargetNotSentOnly"
                            class="w-full"
                            :label="filterTargetNotSentOnly ? 'Only not sent' : 'All'"
                        />
                    </UFormField>
                </div>

                <UButton
                    color="neutral"
                    variant="subtle"
                    icon="lucide:filter"
                    label="Apply Filter"
                />
            </div>

            <PageDistributeParticipantTableForm
                v-model:limit="targetsLimit"
                v-model:page="targetsPage"
                v-model:selected="selectedTargets"
                v-model:select-all="selectAll"
                :tenant-id="tenantId"
                :data="targets"
                :total="targetsTotal"
                :pending="targetsPending"
                with-pagination
            />
        </div>
    </UForm>
</template>
