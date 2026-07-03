<script setup lang="ts">
defineProps<{
    total: number
    withPagination?: boolean
}>()
const limit = defineModel<number>('limit', { default: 0 })
const page = defineModel<number>('page', { default: 0 })
</script>

<template>
    <div>
        <div class="grid grid-cols-4 gap-4 mb-6">
            <UCard
                v-for="n in limit"
                :key="n"
                :ui="{
                  root: 'h-full flex flex-col',
                  header: 'relative h-36',
                  body: 'flex-1 sm:px-4',
                  footer: 'mt-auto sm:px-4',
                }"
            >
                <template #header>
                    <div
                        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        :style="{ backgroundImage: `url('https://sisreg-backend-staging.gumelarix.com/storage/file/public/20260630104409_f6074f9abf1f437998214d6bc5bca301.png')` }"
                    />
                    <UBadge
                        v-if="n < 3"
                        class="absolute right-2 top-2"
                        size="xl"
                        color="warning"
                        label="50% Off"
                    />
                </template>

                <template #default>
                    <div class="flex flex-col h-full">
                        <h3 class="mb-4 font-bold">
                            Berry Delight Deep Within {{ n }} {{ n % 2 ? 'Strawberry Sundae' : '' }}
                        </h3>

                        <div class="mt-auto">
                            <h3
                              v-if="n < 3"
                              class="font-normal text-muted line-through decoration-2"
                            >
                                Rp {{ n+1 }}.000.000
                            </h3>
                            <h2 class="font-bold mb-2">
                                Rp {{ n }}.000.000
                            </h2>

                            <div class="flex gap-2">
                                <UBadge
                                    icon="lucide:package"
                                    color="info"
                                    size="lg"
                                    variant="subtle"
                                    :label="`Stock: ${n+2}`"
                                    :ui="{ base: 'rounded-md!' }"
                                />
                                <UBadge
                                    icon="lucide:package-open"
                                    color="success"
                                    size="lg"
                                    variant="subtle"
                                    :label="`Sold: ${n+1}`"
                                    :ui="{ base: 'rounded-md!' }"
                                />
                            </div>
                        </div>
                    </div>
                </template>

                <template #footer>
                    <div class="flex gap-2 justify-between">
                        <UButton
                            size="lg"
                            icon="lucide:eye"
                            color="neutral"
                            variant="soft"
                            class="w-full"
                            label="Preview"
                        />
                        <div class="flex gap-2">
                            <UButton
                                size="lg"
                                icon="lucide:pencil"
                                color="neutral"
                                variant="soft"
                            />
                            <UButton
                                size="lg"
                                icon="lucide:trash"
                                color="error"
                                variant="soft"
                            />
                        </div>
                    </div>
                </template>
            </UCard>
        </div>

        <DataTablePagination
            v-if="withPagination"
            v-model:limit="limit"
            v-model:page="page"
            :total="total"
            :pagination-limit="[4, 8, 24, 48]"
            :no-border="true"
        />
    </div>
</template>
