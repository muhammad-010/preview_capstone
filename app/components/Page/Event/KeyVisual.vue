<script setup lang="ts">
defineProps<{
    eventId: number
}>()
const certificateActive = defineModel<boolean>('certificate-active', { default: false })
</script>

<template>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
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

        <UCard
            class="w-full"
            :ui="{
                root: 'flex flex-col',
                body: 'flex-1',
            }"
        >
            <template #header>
                <h4>Certificate</h4>
            </template>

            Customize certificate for this event. Can be turned on via 'Additional Features' setting above.

            <template #footer>
                <div class="w-full">
                    <UButton
                        color="neutral"
                        variant="outline"
                        label="Edit Design"
                        size="xl"
                        icon="lucide:pencil"
                        :disabled="!certificateActive"
                        class="w-full"
                        :ui="{ base: 'p-3' }"
                        :to="`/events/${eventId}/digital-certificate-editor`"
                    />
                </div>
            </template>
        </UCard>
    </div>
</template>
