<script setup lang="ts">
defineProps<{
    store: TenantEventStore
    eventTitle?: string
    bgContain?: boolean
}>()
const emit = defineEmits([EMIT_OPEN_EDIT])
</script>

<template>
    <UCard
        variant="subtle"
        :ui="{ body: 'relative p-12 sm:p-14' }"
    >
        <template #default>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div
                    v-if="bgContain"
                    class="absolute inset-0 bg-cover bg-center blur scale-150"
                    :style="{ backgroundImage: `url('${store.image_url}')` }"
                />
                <div
                    class="absolute inset-0 bg-center bg-no-repeat"
                    :class="`${bgContain ? 'bg-contain' : 'bg-cover'}`"
                    :style="{ backgroundImage: `url('${store.image_url}')` }"
                />
                <div
                    class="absolute inset-0 bg-linear-to-r
                    from-gray-50/85 via-gray-50/60 to-gray-50/10
                    dark:from-gray-950/85 dark:via-gray-950/60 dark:to-gray-950/10"
                />

                <div class="z-10">
                    <div class="flex gap-2 mb-4">
                        <UBadge
                            v-if="!store.is_open"
                            size="lg"
                            color="error"
                            variant="outline"
                            label="Closed"
                            class="rounded-full"
                        />
                        <UBadge
                            v-if="eventTitle"
                            size="lg"
                            color="neutral"
                            variant="outline"
                            :label="eventTitle"
                            class="rounded-full"
                        />
                    </div>

                    <div class="max-h-120 overflow-auto mb-8">
                        <h1 class="mb-6 text-6xl font-bold">
                            {{ store.title }}
                        </h1>
                        <p class="text-base/relaxed">
                            {{ store.subtitle }}
                        </p>
                    </div>

                    <UButton
                        v-if="store && store.store_id"
                        size="xl"
                        icon="lucide:pencil"
                        label="Edit Store"
                        @click="() => emit(EMIT_OPEN_EDIT, store.store_id)"
                    />
                </div>
            </div>
        </template>
    </UCard>
</template>
