<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
const props = defineProps<{
    tenantId: number
    eventId: number
    ticketId?: number
    fields?: TenantEventTicketForm
    isModal?: boolean
}>()
const loading = defineModel<boolean>('loading', { default: false })
const success = defineModel<boolean>('success', { default: false })
const formRef = useTemplateRef<Form<TenantEventTicketForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}
defineExpose({ saveData })

const { customAttributes } = await useFindCustomAttribute(props.tenantId, props.eventId)
const isCreate = !props.ticketId
const schema = z.object({
    name: zodStringRequired('Participant name is required'),
    email: zodEmailRequired(),
    phone_number: zodPhoneNumberRequired(),
    max_attendance: zodNumberOptional(),
    custom_attribute: z.array(
        z.object({
            custom_attribute_id: z.number(),
            name: z.string().optional(),
            value: z.string().optional(),
            required: z.boolean().optional(),
        }).superRefine((data, ctx) => {
            if (data.required && !data.value?.trim()) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['value'],
                    message: `Custom Attribute: ${data.name ? `${data.name} ` : ''}Required`,
                })
            }
        }),
    ).nullable().default([]),
    raw_items: z.array(z.any()).min(1, 'At least one item'),
})
type Schema = z.output<typeof schema>

const fields = props.fields
if (fields) {
    if (!fields.custom_attribute || !fields.custom_attribute.length) {
        fields.custom_attribute = cloneObject(unref(customAttributes.value))
    }
    else {
        const latest: CustomAttribute[] = cloneObject(unref(customAttributes.value))
        fields.custom_attribute = latest.map((attr) => {
            const saved = fields.custom_attribute!.find(item => item.custom_attribute_id === attr.custom_attribute_id)

            return { ...attr, value: saved?.value }
        })
    }
}
const state = reactive<Partial<TenantEventTicketForm>>(fields ?? {
    name: '',
    email: '',
    phone_number: '',
    max_attendance: 1,
    custom_attribute: cloneObject(unref(customAttributes.value)),
    abilities: [],
    raw_items: [],
})

function parseSessionToProductItems(raw: number[]): TenantEventStoreProductItem[] {
    const res: TenantEventStoreProductItem[] = []
    for (let i = 0; i < raw.length; i++) {
        res.push({ reference_type: 'event_sessions', reference_id: raw[i]! })
    }
    return res
}

const sessionListPage = ref(1)
const sessionListSearch = ref('')
const sessionListQuery = ref('')
const sessionListHasMore = ref(true)
const {
    data: sessionListData,
    status: sessionListStatus,
    execute: getSessionList,
} = await useLazyApi(`/api/tenant/${props.tenantId}/event/${props.eventId}/session`, {
    query: computed(() => {
        return {
            query: sessionListQuery.value,
            page: sessionListPage.value,
            limit: 10,
        }
    }),
    transform: res => res.data,
    immediate: Boolean(state.raw_items?.length),
})
const participantSession = ref<TenantEventSession[]>([])
watch(sessionListData, (newData) => {
    if (newData) {
        participantSession.value.push(...newData.event_session)
        sessionListHasMore.value = participantSession.value.length < newData.total_data
    }
})
watch(sessionListPage, () => {
    getSessionList()
})
watch(sessionListSearch, (newData, oldData) => {
    if (sessionListStatus.value == 'pending') return

    const query
        = newData.length >= 3
            ? newData
            : oldData.length > newData.length && sessionListQuery.value !== ''
                ? ''
                : null

    if (query === null) return

    participantSession.value = []
    sessionListQuery.value = query
    if (sessionListPage.value === 1) {
        getSessionList()
    }
    else {
        sessionListPage.value = 1
    }
})

const sessionSelectMenu = useTemplateRef('selectMenuRef')
let removeSessionSelectListener: (() => void) | null = null

function attachScrollSessionSelectMenu() {
    nextTick(() => {
        const viewport = sessionSelectMenu.value?.viewportRef
        if (!viewport) return

        const onScroll = () => {
            if (sessionListStatus.value === 'pending') return

            const threshold = 100
            if ((viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - threshold) && sessionListHasMore.value) {
                sessionListPage.value++
            }
        }

        viewport.addEventListener('scroll', onScroll)
        removeSessionSelectListener = () => {
            viewport.removeEventListener('scroll', onScroll)
        }
    })
}

function onOpenSessions(open: boolean) {
    if (!open) {
        removeSessionSelectListener?.()
        return
    }

    if (!participantSession.value.length) {
        getSessionList()
    }

    attachScrollSessionSelectMenu()
}
onMounted(() => {
    if (!isCreate) {
        getSessionList()
    }
})
onBeforeUnmount(() => removeSessionSelectListener?.())

async function addData(payload: FormSubmitEvent<Schema>) {
    try {
        const body: TenantEventTicketForm = {
            name: payload.data.name,
            email: payload.data.email,
            phone_number: payload.data.phone_number,
            max_attendance: payload.data.max_attendance ?? 1,
            custom_attribute: formatCleanCustomAttribute(payload.data.custom_attribute ?? []),
            abilities: [],
        }

        if (payload.data.raw_items.length) {
            body.abilities = parseSessionToProductItems(payload.data.raw_items)
        }
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/ticket`, {
            method: 'POST',
            body,
        })
        if (data.success) {
            successToast({ description: 'A participant has been created' })
            success.value = true
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to create new participant' })
    }
}

async function editData(payload: FormSubmitEvent<Schema>, ticketId: number) {
    try {
        const body: TenantEventTicketForm = {
            name: payload.data.name,
            email: payload.data.email,
            phone_number: payload.data.phone_number,
            max_attendance: payload.data.max_attendance ?? 1,
            custom_attribute: formatCleanCustomAttribute(payload.data.custom_attribute ?? []),
            abilities: [],
        }

        if (payload.data.raw_items.length) {
            body.abilities = parseSessionToProductItems(payload.data.raw_items)
        }
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/ticket/${ticketId}`, {
            method: 'PUT',
            body,
        })
        if (data.success) {
            successToast({ description: 'A participant has been updated' })
            success.value = true
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to update new participant' })
    }
}

async function submitData(payload: FormSubmitEvent<Schema>) {
    loading.value = true
    if (isCreate) {
        await addData(payload)
    }
    else {
        await editData(payload, props.ticketId)
    }
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
            class="grid gap-6"
            :class="isModal ? '' : 'md:grid-cols-2'"
        >
            <UFormField
                label="Participant Name"
                name="name"

                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInput
                    v-model="state.name"
                    type="text"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Email"
                name="email"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInput
                    v-model="state.email"
                    type="text"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Phone Number"
                name="phone_number"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInput
                    v-model="state.phone_number"
                    type="text"
                    :maxlength="MAX_PHONE_NUMBER"
                    :placeholder="PHONE_NUMBER_PLACEHOLDER"
                    aria-describedby="char-count"
                    class="w-full"
                >
                    <template #trailing>
                        <div
                            id="character-count"
                            class="text-xs text-muted"
                            aria-live="polite"
                            role="status"
                        >
                            {{ state.phone_number?.length }}/{{ MAX_PHONE_NUMBER }}
                        </div>
                    </template>
                </UInput>
            </UFormField>

            <UFormField
                label="Assigned Session"
                name="raw_items"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <USelectMenu
                    ref="selectMenuRef"
                    v-model="state.raw_items"
                    v-model:search-term="sessionListSearch"
                    :loading="sessionListStatus === 'pending'"
                    multiple
                    class="w-full"
                    value-key="event_session_id"
                    label-key="name"
                    :items="participantSession"
                    @update:open="onOpenSessions"
                />
            </UFormField>

            <UFormField
                v-for="(item, index) in state.custom_attribute"
                :key="index"
                :label="`Custom Attribute: ${item.name}`"
                :name="`custom_attribute.${index}.value`"
                :class="`${isModal ? '' : 'my-2'} w-full`"
                :required="state.custom_attribute![index]!.required ?? false"
            >
                <UInput
                    v-model="state.custom_attribute![index]!.value"
                    type="string"
                    class="w-full"
                />
            </UFormField>
        </div>
    </UForm>
</template>
