<script setup lang="ts">
defineProps<{
    participants: TenantEventTicket[]
}>()
const open = defineModel<boolean>({ default: false })
const emit = defineEmits([EMIT_MODAL_SELECT])
</script>

<template>
    <UModal
        v-model:open="open"
        :dismissible="false"
        title="Please select correct data below"
    >
        <template #body>
            <div class="flex flex-col justify-center px-12">
                <UCard
                    v-for="participant in participants"
                    :key="participant.ticket_id"
                    variant="subtle"
                    class="cursor-pointer mb-6"
                    :ui="{ root: 'hover:ring hover:ring-primary' }"
                    @click="() => emit(EMIT_MODAL_SELECT, participant.ticket_id || 0)"
                >
                    <div class="flex justify-between">
                        <div>
                            <h5>{{ participant.name }}</h5>
                            {{ participant.phone_number }}
                        </div>
                    </div>
                </UCard>
            </div>
        </template>
    </UModal>
</template>
