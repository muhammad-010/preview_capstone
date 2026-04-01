<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { FormSubmitEvent, FormError, TableColumn } from '@nuxt/ui'

type ToggleAllPageRowsSelected = (value?: boolean | undefined) => void

const { $api } = useNuxtApp()
const props = defineProps<{
    eventId: number
    data: Participant[]
    total: number
    pending?: boolean
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })
const selected = defineModel<number[]>('selected', { default: () => [] })
const filterCustomAttribute = defineModel<CustomAttribute[]>('filter-custom-attribute', { default: () => [] })
const filterCheckedIn = defineModel<boolean | null>('filter-checked-in', { default: null })
const filterCustomAttributeField = ref(structuredClone(toRaw(unref(filterCustomAttribute))))
const cleanedFilterCustomAttribute = computed(() => formatCleanCustomAttribute(filterCustomAttribute.value))
const filterCustomAttributeButtonLabel = computed(() => cleanedFilterCustomAttribute.value.map(attr => `${attr.name}: ${attr.value}`).join(', '))
const filterCheckedInItems = [
    {
        label: 'All',
        value: null,
    },
    {
        label: 'Yes',
        value: true,
    },
    {
        label: 'No',
        value: false,
    },
]
const filterCheckedInField = ref<boolean | null>(null)
const filterCheckedInLabel = computed(() => filterCheckedInItems.find(e => e.value === filterCheckedIn.value)?.label || 'Invalid Data')
const emit = defineEmits([EMIT_TABLE_REFRESH])
const toast = useToast()
const { tenantId } = useUserState()
const rowSelection = ref<Record<string, boolean>>({})
const selectAll = ref(false)
const resetSelectionConfirmation = ref(false)
const filterCustomAttributeDialog = ref(false)
const filterCheckedInDialog = ref(false)
const deleteConfirmation = ref(false)
const deleteTarget = ref({
    id: 0,
    name: '',
})
const manualCheckInTarget = ref({
    id: 0,
    name: '',
    maxAttendance: 0,
})
const manualCheckInConfirmation = ref(false)
const manualCheckInGuestConfirmation = ref(false)
const manualCheckInGuest = reactive({ count: 0 })
const resetFunction = ref<ToggleAllPageRowsSelected>()

type CheckInGuestSchema = typeof manualCheckInGuest

function toggle(pId: number | undefined) {
    if (!pId) return

    const data = selected.value
    const i = data.indexOf(pId)

    if (i !== -1) {
        data.splice(i, 1)
    }
    else {
        data.push(pId)
    }

    selected.value = data
}

/** all is null, so this worked for select all */
function clearSelection(all: boolean) {
    selected.value = []
    selectAll.value = all
}

function askResetSelection(cb: ToggleAllPageRowsSelected) {
    resetFunction.value = cb
    resetSelectionConfirmation.value = true
}

function confirmResetSelection() {
    const cb = resetFunction.value
    if (cb) cb(false)
    clearSelection(false)
    resetFunction.value = undefined
    resetSelectionConfirmation.value = false
}

function refreshFilterCustomAttributeDialog() {
    filterCustomAttribute.value = structuredClone(toRaw(unref(filterCustomAttributeField.value)))
    emit(EMIT_TABLE_REFRESH)
}

function clearFilterCustomAttributeDialog(refresh: boolean) {
    for (let index = 0; index < filterCustomAttributeField.value.length; index++) {
        filterCustomAttributeField.value![index]!.value = ''
    }
    if (refresh) refreshFilterCustomAttributeDialog()
}

function closeFilterCustomAttributeDialog(close: () => void) {
    filterCustomAttributeDialog.value = false
    close()
}

function applyFilterCustomAttributeDialog(close: () => void) {
    close()
    refreshFilterCustomAttributeDialog()
}

function refreshFilterCheckedIn() {
    filterCheckedIn.value = filterCheckedInField.value
    emit(EMIT_TABLE_REFRESH)
}

function clearFilterCheckedIn(refresh: boolean) {
    filterCheckedInField.value = null
    if (refresh) refreshFilterCheckedIn()
}

function closeFilterCheckedInDialog(close: () => void) {
    filterCheckedInDialog.value = false
    close()
}

function applyFilterCheckedInDialog(close: () => void) {
    close()
    refreshFilterCheckedIn()
}

function setDeleteTarget(id: number, name: string) {
    deleteTarget.value.id = id
    deleteTarget.value.name = name
}

function openDeleteConfirmation(id: number, name: string) {
    setDeleteTarget(id, name)
    deleteConfirmation.value = true
}

function closeDeleteConfirmation() {
    setDeleteTarget(0, '')
    deleteConfirmation.value = false
    emit(EMIT_TABLE_REFRESH)
}

async function deleteData(id: number) {
    try {
        const data = await $api(`/api/tenant/${tenantId.value}/event/${props.eventId}/participant/${id}`, {
            method: 'DELETE',
        })
        if (data.success) {
            toast.add({
                title: 'Success',
                description: 'A participant has been deleted',
                color: 'success',
            })
        }
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to delete participant',
            color: 'error',
        })
        console.error('Delete participant error', error)
    }
    closeDeleteConfirmation()
}

function openConfirmManualCheckIn(id: number, name: string) {
    manualCheckInTarget.value = { id, name, maxAttendance: 0 }
    manualCheckInConfirmation.value = true
}

function resetManualCheckInTarget() {
    manualCheckInTarget.value = {
        id: 0,
        name: '',
        maxAttendance: 0,
    }
}

function closeConfirmManualCheckIn(reset: boolean) {
    manualCheckInConfirmation.value = false
    if (reset) resetManualCheckInTarget()
}

function closeConfirmManualCheckInGuest() {
    manualCheckInGuestConfirmation.value = false
    resetManualCheckInTarget()
}

async function manualCheckIn() {
    try {
        const { data } = await $api(`/api/tenant/${tenantId.value}/event/${props.eventId}/participant/check-in/manual`, {
            method: 'POST',
            body: {
                participant_id: manualCheckInTarget.value.id,
            },
        })
        manualCheckInTarget.value.maxAttendance = data.participant.max_attendance
        if (data.confirmation_attendance) {
            manualCheckInGuestConfirmation.value = true
        }
        else {
            toast.add({
                title: 'Success',
                description: 'Manual check in success',
                color: 'success',
            })
        }
        closeConfirmManualCheckIn(!data.confirmation_attendance)
        emit(EMIT_TABLE_REFRESH)
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to manually check in participant',
            color: 'error',
        })
        console.error('Manual check in participant error', error)
    }
}

function validateManualCheckInGuest(state: Partial<CheckInGuestSchema>): FormError[] {
    const errors = []
    if (!state.count) errors.push({ name: 'count', message: 'Guest count is required, minimum is 1' })
    else if (state.count > manualCheckInTarget.value.maxAttendance) errors.push({ name: 'count', message: `Can not more than ${manualCheckInTarget.value.maxAttendance}` })
    return errors
}

async function manualCheckInGuestSubmit(event: FormSubmitEvent<CheckInGuestSchema>) {
    try {
        await $api(`/api/tenant/${tenantId.value}/event/${props.eventId}/participant/check-in/confirm/manual`, {
            method: 'POST',
            body: {
                participant_id: manualCheckInTarget.value.id,
                count_attendance: Number(event.data.count),
            },
        })
        toast.add({
            title: 'Success',
            description: 'Manual submit participant guest success',
            color: 'success',
        })
        closeConfirmManualCheckInGuest()
        emit(EMIT_TABLE_REFRESH)
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to manually submit participant guest',
            color: 'error',
        })
        console.error('Manual submit participant guest error', error)
    }
}

watch(
    () => props.data,
    () => {
        const map: Record<string, boolean> = {}
        props.data.forEach((value, index) => {
            if (selectAll.value || (value.participant_id && selected.value.includes(value.participant_id))) {
                map[index] = true
            }
        })
        rowSelection.value = map
    },
    { immediate: true, deep: true },
)

function useColumns() {
    const UBadge = resolveComponent('UBadge')
    const UButton = resolveComponent('UButton')
    const UCheckbox = resolveComponent('UCheckbox')
    const tableRef = useTemplateRef('tableRef')

    function qrSent(participant: Participant) {
        if (!participant.latest_invitation_log) {
            return h('span', { class: 'text-dimmed' }, 'Not Sent')
        }

        const qrSent = []
        if (participant.latest_invitation_log.email) {
            qrSent.push(
                h(UBadge, {
                    class: 'w-max',
                    color: INVITATION_STATUS_COLORS[participant.latest_invitation_log.email.status],
                    variant: 'subtle',
                    label: `Email: ${participant.latest_invitation_log.email.status}`,
                }),
            )
        }
        if (participant.latest_invitation_log.whatsapp) {
            qrSent.push(
                h(UBadge, {
                    class: 'w-max',
                    color: INVITATION_STATUS_COLORS[participant.latest_invitation_log.whatsapp.status],
                    variant: 'subtle',
                    label: `Whatsapp: ${participant.latest_invitation_log.whatsapp.status}`,
                }),
            )
        }
        return qrSent
    }

    const columns = [
        {
            id: 'select',
            header: ({ table }) =>
                h(UCheckbox, {
                    'modelValue': table.getIsSomePageRowsSelected()
                        ? 'indeterminate'
                        : table.getIsAllPageRowsSelected(),
                    'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
                        clearSelection(!!value)
                        table.toggleAllPageRowsSelected(!!value)
                    },
                    'aria-label': 'Select all',
                }),
            cell: ({ table, row }) =>
                h(UCheckbox, {
                    'modelValue': row.getIsSelected(),
                    'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
                        if (table.getIsAllPageRowsSelected()) {
                            askResetSelection(table.toggleAllPageRowsSelected)
                            return
                        }
                        toggle(row.original.participant_id)
                        row.toggleSelected(!!value)
                    },
                    'aria-label': 'Select row',
                }),
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', { class: 'font-semibold' }, row.original.name),
                    ...(row.original.max_attendance
                        ? [
                                h('br'),
                                h('span', { class: 'text-sm' }, `${row.original.max_attendance} Attendance${row.original.max_attendance > 1 ? 's' : ''}`),
                            ]
                        : []
                    ),
                ])
            },
        },
        {
            accessorKey: 'email',
            header: 'Contact',
            cell: ({ row }) => {
                return h('div', {}, [
                    h('span', {}, row.original.email || ''),
                    h('br'),
                    h('span', {}, row.original.phone_number || ''),
                ])
            },
        },
        {
            accessorKey: 'custom_attribute',
            header: 'Metadata',
            cell: ({ row }) => {
                return h('div',
                    {},
                    row.original.custom_attribute && row.original.custom_attribute.length
                        ? row.original.custom_attribute
                                .map(attr => h('div', {}, [
                                    h('span', { class: 'font-semibold' }, attr.name ? `${attr.name}: ` : ''),
                                    h('span', {}, attr.value),
                                ]))
                        : h('span', {}, '-'),
                )
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                return h(UBadge, {
                    color: PARTICIPANT_STATUS_COLORS[row.getValue('status') as ParticipantStatus],
                    variant: 'subtle',
                    label: row.original.status,
                })
            },
        },
        {
            accessorKey: 'latest_invitation_log',
            header: 'QR Sent',
            cell: ({ row }) => h('div', { class: 'flex flex-col gap-2' }, qrSent(row.original)),
        },
        {
            accessorKey: 'participant_id',
            header: 'Action',
            cell: ({ row }) => {
                return h('div', { class: 'flex gap-2' }, [
                    h(UButton, {
                        color: row.original.status === PARTICIPANT_STATUS_CHECKED_IN ? 'neutral' : 'primary',
                        variant: row.original.status === PARTICIPANT_STATUS_CHECKED_IN ? 'outline' : 'solid',
                        disabled: row.original.status === PARTICIPANT_STATUS_CHECKED_IN,
                        icon: 'lucide:circle-check',
                        onClick: () => openConfirmManualCheckIn(row.original.participant_id || 0, row.original.name),
                    }),
                    h(UButton, {
                        color: 'neutral',
                        variant: 'ghost',
                        icon: 'lucide:pencil',
                        to: `/events/${props.eventId}/participant/${row.original.participant_id}/edit`,
                    }),
                    h(UButton, {
                        color: 'error',
                        variant: 'ghost',
                        icon: 'lucide:trash',
                        onClick: () => openDeleteConfirmation(row.original.participant_id || 0, row.original.name),
                    }),
                ])
            },
        },
    ] as TableColumn<Participant>[]

    return { columns, tableRef }
}

const { columns, tableRef } = useColumns()
</script>

<template>
    <div>
        <div class="flex flex-wrap gap-2 mb-4">
            <span>Filter:</span>
            <UFieldGroup>
                <UButton
                    color="neutral"
                    variant="subtle"
                    size="xs"
                    :icon="`lucide:${cleanedFilterCustomAttribute.length ? 'pencil' : 'plus'}`"
                    label="Metadata"
                    @click="filterCustomAttributeDialog = true"
                />
                <UButton
                    v-if="cleanedFilterCustomAttribute.length"
                    color="neutral"
                    variant="outline"
                    size="xs"
                    :label="filterCustomAttributeButtonLabel"
                    @click="filterCustomAttributeDialog = true"
                />
                <UButton
                    v-if="cleanedFilterCustomAttribute.length"
                    color="error"
                    variant="subtle"
                    size="xs"
                    icon="lucide:x"
                    @click="() => clearFilterCustomAttributeDialog(true)"
                />
            </UFieldGroup>

            <UFieldGroup>
                <UButton
                    color="neutral"
                    variant="subtle"
                    size="xs"
                    :icon="`lucide:${filterCheckedIn !== null ? 'pencil' : 'plus'}`"
                    label="Checked In"
                    @click="filterCheckedInDialog = true"
                />
                <UButton
                    v-if="filterCheckedIn !== null"
                    color="neutral"
                    variant="outline"
                    size="xs"
                    :label="filterCheckedInLabel"
                    @click="filterCheckedInDialog = true"
                />
                <UButton
                    v-if="filterCheckedIn !== null"
                    color="error"
                    variant="subtle"
                    size="xs"
                    icon="lucide:x"
                    @click="clearFilterCheckedIn(true)"
                />
            </UFieldGroup>
        </div>

        <UTable
            ref="tableRef"
            v-model:row-selection="rowSelection"
            :data="data"
            :columns="columns"
            :loading="pending"
        />

        <MiscPagination
            v-if="withPagination"
            v-model:limit="limit"
            v-model:page="page"
            :total="total"
        />

        <ModalConfirmNegativeAction
            v-model:open="resetSelectionConfirmation"
            title="Reset Selection"
            body="Are you sure you want to reset selection?"
            confirm-label="Yes, Reset Selection"
            @confirm="confirmResetSelection"
        />

        <ModalConfirmNegativeAction
            v-model:open="deleteConfirmation"
            title="Delete Confirmation"
            :body="`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone`"
            @confirm="deleteData(deleteTarget.id)"
        />

        <ModalConfirmPositiveAction
            v-model:open="manualCheckInConfirmation"
            title="Manual Check-In Confirmation"
            :body="`Are you sure you want to check-in ${manualCheckInTarget.name}?`"
            @confirm="manualCheckIn()"
        />

        <UModal
            v-model:open="manualCheckInGuestConfirmation"
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
                <div class="flex flex-col">
                    <div class="text-center mb-4">
                        <h3>
                            Please confirm guests attendance for {{ manualCheckInTarget.name }}
                        </h3>
                        <h4>
                            (Max {{ manualCheckInTarget.maxAttendance }})
                        </h4>
                    </div>

                    <UForm
                        :validate="validateManualCheckInGuest"
                        :state="manualCheckInGuest"
                        class="flex flex-col items-center"
                        @submit="manualCheckInGuestSubmit"
                    >
                        <UFormField
                            label="Number of guests"
                            name="count"
                            required
                            class="mb-4"
                        >
                            <UInput
                                v-model="manualCheckInGuest.count"
                                class="text-center"
                                :ui="{
                                    base: 'text-center',
                                }"
                            >
                                <template #leading>
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        icon="lucide:minus"
                                        size="xl"
                                        :disabled="manualCheckInGuest.count === 0"
                                        @click="manualCheckInGuest.count--"
                                    />
                                </template>
                                <template #trailing>
                                    <UButton
                                        color="neutral"
                                        variant="link"
                                        icon="lucide:plus"
                                        size="xl"
                                        :disabled="manualCheckInGuest.count === manualCheckInTarget.maxAttendance"
                                        @click="manualCheckInGuest.count++"
                                    />
                                </template>
                            </UInput>
                        </UFormField>
                        <UButton
                            type="submit"
                            label="Check In"
                            class="cursor-pointer"
                        />
                    </UForm>
                </div>
            </template>
        </UModal>

        <UModal v-model:open="filterCustomAttributeDialog">
            <template #header="{ close }">
                <div class="flex justify-between items-center w-full">
                    <h5>Filter Metadata</h5>

                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="lucide:x"
                        @click="() => closeFilterCustomAttributeDialog(close)"
                    />
                </div>
            </template>

            <template #body>
                <UFormField
                    v-for="(item, index) in filterCustomAttributeField"
                    :key="index"
                    :label="item.name"
                    class="mb-4 w-full"
                >
                    <UInput
                        v-model="filterCustomAttributeField![index]!.value"
                        type="string"
                        class="w-full"
                    >
                        <template #trailing>
                            <UButton
                                v-if="filterCustomAttributeField![index]!.value"
                                color="neutral"
                                variant="link"
                                size="sm"
                                icon="lucide:x"
                                @click="filterCustomAttributeField![index]!.value = ''"
                            />
                        </template>
                    </UInput>
                </UFormField>
            </template>

            <template #footer="{ close }">
                <div class="flex justify-end items-center w-full">
                    <div class="flex gap-2">
                        <UButton
                            color="neutral"
                            variant="outline"
                            icon="lucide:x"
                            class="cursor-pointer"
                            label="Cancel"
                            @click="() => closeFilterCustomAttributeDialog(close)"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            label="Apply Filter"
                            @click="() => applyFilterCustomAttributeDialog(close)"
                        />
                    </div>
                </div>
            </template>
        </UModal>

        <UModal v-model:open="filterCheckedInDialog">
            <template #header="{ close }">
                <div class="flex justify-between items-center w-full">
                    <h5>Filter Checked In</h5>

                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="lucide:x"
                        @click="() => closeFilterCustomAttributeDialog(close)"
                    />
                </div>
            </template>

            <template #body>
                <URadioGroup
                    v-model="filterCheckedInField"
                    :items="filterCheckedInItems"
                />
            </template>

            <template #footer="{ close }">
                <div class="flex justify-end items-center w-full">
                    <div class="flex gap-2">
                        <UButton
                            color="neutral"
                            variant="outline"
                            icon="lucide:x"
                            class="cursor-pointer"
                            label="Cancel"
                            @click="() => closeFilterCheckedInDialog(close)"
                        />
                        <UButton
                            color="primary"
                            icon="lucide:save"
                            class="cursor-pointer"
                            label="Apply Filter"
                            @click="() => applyFilterCheckedInDialog(close)"
                        />
                    </div>
                </div>
            </template>
        </UModal>
    </div>
</template>
