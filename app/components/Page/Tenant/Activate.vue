<script setup lang="ts">
const props = defineProps<{
    tenant: Tenant
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])

const { $api } = useNuxtApp()
const toast = useToast()
const activateConfirmation = ref(false)
const activateLoading = ref(false)

async function activateData() {
    if (!props.tenant.tenant_id) return
    try {
        activateLoading.value = true
        const data = await $api(`/api/tenant/${props.tenant.tenant_id}/status`, {
            method: 'PATCH',
            body: {
                status: STATUS_ACTIVE,
            } as ActivateDeactivate,
        })
        if (data.success) {
            activateConfirmation.value = false
            toast.add({
                title: 'Success',
                description: 'A tenant has been activated',
                color: 'success',
            })
        }
    }
    catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to activate new tenant',
            color: 'error',
        })
        console.error('Activate tenant error', error)
    }
    finally {
        activateLoading.value = false
        emit(EMIT_DETAIL_REFRESH)
    }
}
</script>

<template>
    <UButton
        v-if="tenant.status === STATUS_INACTIVE"
        color="success"
        variant="outline"
        icon="lucide:check"
        class="cursor-pointer"
        @click="activateConfirmation = true"
    >
        Activate Tenant
    </UButton>

    <ModalConfirmPositiveAction
        v-model:open="activateConfirmation"
        title="Activate Confirmation"
        :body="`Are you sure you want to activate ${tenant.name}? All services and access will be enabled for this tenant`"
        :loading="activateLoading"
        @confirm="activateData"
    />
</template>
