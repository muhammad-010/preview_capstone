<script setup lang="ts">
const props = defineProps<{
    tenant: Tenant
    reroute?: boolean
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])

const { $api } = useNuxtApp()
const router = useRouter()
const toast = useToast()
const deleteConfirmation = ref(false)
const deleteLoading = ref(false)

async function deleteData() {
    if (!props.tenant.tenant_id) return
    try {
        deleteLoading.value = true
        const data = await $api(`/api/tenant/${props.tenant.tenant_id}`, {
            method: 'DELETE',
        })
        if (data.success) {
            toast.add({
                title: 'Success',
                description: 'A tenant has been deleted',
                color: 'success',
            })
            emit(EMIT_DETAIL_REFRESH)
            if (props.reroute) router.go(-1)
        }
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to delete tenant',
            color: 'error',
        })
        console.error('Delete tenant error', error)
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
        Delete Tenant
    </UButton>

    <ModalConfirmNegativeAction
        v-model:open="deleteConfirmation"
        title="Delete Confirmation"
        :body="`Are you sure you want to delete ${tenant.name}? This action cannot be undone`"
        :loading="deleteLoading"
        @confirm="deleteData"
    />
</template>
