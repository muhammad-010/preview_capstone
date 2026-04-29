<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const props = defineProps<{
    tenantId: number
    eventId: number
    data: CustomAttribute[]
    total: number
    pending?: boolean
    withPagination?: boolean
}>()

const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })
const emit = defineEmits([EMIT_TABLE_REFRESH, EMIT_TABLE_OPEN_EDIT])

function triggerRefresh(skipResetPage?: boolean) {
    if (!skipResetPage) {
        page.value = 1
    }
    emit(EMIT_TABLE_REFRESH)
}

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()

// DELETION
const deleteConfirmation = ref(false)
const deleteTarget = ref({
    id: 0,
    name: '',
})

function setDeleteTarget(id: number, name: string) {
    deleteTarget.value.id = id
    deleteTarget.value.name = name
}

function openDeleteConfirmation(id: number, name: string) {
    setDeleteTarget(id, name)
    deleteConfirmation.value = true
}

function closeDeleteConfirmation(skipResetPage?: boolean) {
    setDeleteTarget(0, '')
    deleteConfirmation.value = false
    triggerRefresh(skipResetPage)
}

async function deleteData(id: number) {
    try {
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/attribute/${id}`, {
            method: 'DELETE',
        })
        if (data.success) {
            successToast({ description: 'A custom attribute has been deleted' })
            closeDeleteConfirmation()
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to delete custom attribute' })
        closeDeleteConfirmation(true)
    }
}

function useColumns() {
    const UButton = resolveComponent('UButton')
    const UTooltip = resolveComponent('UTooltip')

    return [
        {
            accessorKey: 'name',
            header: 'Name',
            meta: {
                class: {
                    td: 'max-w-50',
                },
            },
            cell: ({ row }) => {
                return h('div', { class: 'truncate font-semibold' }, row.original.name)
            },
        },
        {
            accessorKey: 'is_visible',
            header: 'Visible When Check-In',
            cell: ({ row }) => {
                return h('span', {}, row.original.is_visible ? 'Yes' : 'No')
            },
        },
        {
            accessorKey: 'custom_attribute_id',
            header: 'Action',
            meta: {
                class: {
                    td: 'w-[1%]',
                },
            },
            cell: ({ row }) => {
                const _ = row
                return h('div', { class: 'inline-flex gap-2' }, [
                    h(UTooltip, { text: 'Edit', delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'neutral',
                            variant: 'ghost',
                            icon: 'lucide:pencil',
                            onClick: () => emit(
                                EMIT_TABLE_OPEN_EDIT,
                                {
                                    name: row.original.name || '',
                                } as CustomAttributeForm,
                                row.original.custom_attribute_id),
                        }),
                    ]),
                    h(UTooltip, { text: 'Delete', delayDuration: 0 }, () => [
                        h(UButton, {
                            color: 'error',
                            variant: 'ghost',
                            icon: 'lucide:trash',
                            onClick: () => openDeleteConfirmation(row.original.custom_attribute_id || 0, row.original.name || ''),
                        }),
                    ]),
                ])
            },
        },
    ] as TableColumn<CustomAttribute>[]
}

const columns = useColumns()
</script>

<template>
    <div>
        <UTable
            :data="data"
            :columns="columns"
            :loading="pending"
        />

        <DataTablePagination
            v-if="withPagination"
            v-model:limit="limit"
            v-model:page="page"
            :total="total"
        />

        <ModalConfirmNegativeAction
            v-model:open="deleteConfirmation"
            title="Delete Confirmation"
            :body="`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone`"
            @confirm="deleteData(deleteTarget.id)"
        />
    </div>
</template>
