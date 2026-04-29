<script setup lang="ts">
const props = defineProps<{
    tenant: Tenant
}>()
const emit = defineEmits([EMIT_DETAIL_REFRESH])

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
const deactivateConfirmation = ref(false)
const deactivateLoading = ref(false)

async function deactivateData() {
    if (!props.tenant.tenant_id) return
    try {
        deactivateLoading.value = true
        const data = await $api(`/api/tenant/${props.tenant.tenant_id}/status`, {
            method: 'PATCH',
            body: {
                status: STATUS_INACTIVE,
            } as ActivateDeactivate,
        })
        if (data.success) {
            deactivateConfirmation.value = false
            successToast({ description: 'A tenant has been deactivated' })
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to deactivate new tenant' })
    }
    finally {
        deactivateLoading.value = false
        emit(EMIT_DETAIL_REFRESH)
    }
}
</script>

<template>
    <UButton
        v-if="tenant.status === STATUS_ACTIVE"
        color="error"
        variant="outline"
        icon="lucide:ban"
        class="cursor-pointer"
        @click="deactivateConfirmation = true"
    >
        Deactivate Tenant
    </UButton>

    <ModalConfirmNegativeAction
        v-model:open="deactivateConfirmation"
        title="Deactivate Confirmation"
        :body="`Are you sure you want to deactivate ${tenant.name}? All services and access will be disabled for this tenant`"
        :loading="deactivateLoading"
        @confirm="deactivateData"
    />
</template>
