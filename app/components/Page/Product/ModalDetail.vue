<script setup lang="ts">
defineProps<{
    bgContain?: boolean
}>()
const dialog = defineModel<boolean>('open', { default: false })
const fields = defineModel<TenantEventStoreProduct | undefined>('fields', { default: undefined })

function closeDialog(close: () => void) {
    close()
}

function formatPrice(value: number, currency?: string): string {
    const formatter = getCurrencyFormatter(currency)
    return formatter.format(value)
}
</script>

<template>
    <UModal
        v-model:open="dialog"
        :ui="{ content: 'sm:max-w-7xl' }"
    >
        <template #content="{ close }">
            <div
                v-if="fields"
                class="grid grid-cols-1 lg:grid-cols-3"
            >
                <div class="relative">
                    <div
                        class="absolute inset-0 bg-center bg-no-repeat"
                        :class="`${bgContain ? 'bg-contain' : 'bg-cover'}`"
                        :style="{ backgroundImage: `url('${fields.image_url}')` }"
                    />
                </div>

                <div class="m-4 lg:col-span-2 lg:mx-8">
                    <div class="flex justify-between gap-4 py-2">
                        <p
                            v-if="fields.status === 'inactive'"
                            class="text-error mb-2"
                        >
                            Unpublished
                        </p>
                        <p
                            v-else-if="fields.sale_start_at && formatIsAfterDate(fields.sale_start_at)"
                            class="text-warning mb-2"
                        >
                            Sale starts on {{ formatLongDate(fields.sale_start_at) }}
                        </p>
                        <p
                            v-else
                            class="text-success mb-2"
                        >
                            On Sale
                        </p>

                        <UButton
                            color="neutral"
                            variant="ghost"
                            icon="lucide:x"
                            @click="() => closeDialog(close)"
                        />
                    </div>

                    <div class="mb-4">
                        <span class="text-4xl font-bold">{{ fields.name }}</span>
                    </div>
                    <div class="mb-2">
                        <div class="flex items-center gap-4 mb-2">
                            <span
                                v-if="fields.discount_value > 0"
                                class="text-2xl font-normal text-muted line-through decoration-2"
                            >
                                {{ formatPrice(fields.price, fields.currency) }}
                            </span>
                            <UBadge
                                v-if="fields.discount_value > 0"
                                size="xl"
                                variant="subtle"
                                color="warning"
                                :label="`${fields.discount_value}% Off`"
                            />
                        </div>

                        <span class="text-3xl font-bold mb-2">
                            {{ formatPrice(fields.final_price || fields.price, fields.currency) }}
                        </span>
                    </div>

                    <div class="flex gap-2 mb-4">
                        <UBadge
                            icon="lucide:package"
                            color="info"
                            size="lg"
                            variant="subtle"
                            :label="`Stock: ${fields.stock?.total || 0}`"
                            :ui="{ base: 'rounded-md!' }"
                        />
                        <UBadge
                            icon="lucide:package-open"
                            color="success"
                            size="lg"
                            variant="subtle"
                            :label="`Sold: ${fields.stock?.reserved || 0}`"
                            :ui="{ base: 'rounded-md!' }"
                        />
                    </div>

                    <p class="text-base/relaxed whitespace-pre-wrap">
                        {{ fields.description }}
                    </p>
                </div>
            </div>
        </template>
    </UModal>
</template>
