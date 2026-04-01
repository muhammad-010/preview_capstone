<script setup lang="ts">
const props = defineProps<{
    tenantId: number
    event: TenantEvent
    reroute?: boolean
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])

const { $api } = useNuxtApp()
const router = useRouter()
const toast = useToast()
const deleteConfirmation = ref(false)
const deleteLoading = ref(false)

async function deleteData() {
    if (!props.event.event_id) return
    try {
        deleteLoading.value = true
        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.event.event_id}`, {
            method: 'DELETE',
        })
        if (data.success) {
            toast.add({
                title: 'Success',
                description: 'An event has been deleted',
                color: 'success',
            })
            emit(EMIT_DETAIL_REFRESH)
            if (props.reroute) router.go(-1)
        }
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to delete event',
            color: 'error',
        })
        console.error('Delete event error', error)
    }
    finally {
        deleteLoading.value = false
    }
}
</script>

<template>
    <UButton
        color="error"
        icon="lucide:trash"
        class="cursor-pointer"
        @click="deleteConfirmation = true"
    >
        Delete Event
    </UButton>

    <ModalConfirmNegativeAction
        v-model:open="deleteConfirmation"
        title="Delete Confirmation"
        :body="`Are you sure you want to delete ${event.name}? This action cannot be undone`"
        :loading="deleteLoading"
        @confirm="deleteData"
    />
</template>
