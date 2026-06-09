<script setup lang="ts">
defineProps<{
    eventId: number
}>()
</script>

<template>
    <div class="grid grid-cols-2 gap-4 w-full">
        <UCard
            class="w-full"
            :ui="{
                root: 'flex flex-col',
                body: 'flex-1',
            }"
        >
            <template #header>
                <h4>Invitation QR Code</h4>
            </template>

            Customize the digital ticket that attendees receive. You can add their name, ticket type, and the scannable QR code.

            <template #footer>
                <div class="w-full">
                    <UButton
                        color="neutral"
                        variant="outline"
                        label="Edit Design"
                        size="xl"
                        icon="lucide:pencil"
                        class="w-full"
                        :ui="{ base: 'p-3' }"
                        :to="`/events/${eventId}/digital-invitation-editor`"
                    />
                </div>
            </template>
        </UCard>

        <UCard
            class="w-full"
            :ui="{
                root: 'flex flex-col',
                body: 'flex-1',
            }"
        >
            <template #header>
                <h4>Scan QR Page</h4>
            </template>

            Customize the screen shown to POCs or attendees during the check-in process.

            <template #footer>
                <div class="w-full">
                    <UButton
                        color="neutral"
                        variant="outline"
                        label="Edit Design"
                        size="xl"
                        icon="lucide:pencil"
                        class="w-full"
                        :ui="{ base: 'p-3' }"
                        :to="`/events/${eventId}/check-in-page-editor`"
                    />
                </div>
            </template>
        </UCard>
    </div>
</template>

