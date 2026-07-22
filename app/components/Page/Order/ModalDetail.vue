<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

function formatCurrency(value: number, currency?: string): string {
    const formatter = getCurrencyFormatter(currency)
    return formatter.format(value)
}
</script>

<template>
    <UModal
        v-model:open="open"
        :ui="{ content: 'sm:max-w-3xl' }"
    >
        <template #header="{ close }">
            <div class="flex items-center justify-between w-full">
                <span class="text-lg font-semibold">
                    Transaction Detail
                </span>

                <UButton
                    color="neutral"
                    variant="ghost"
                    icon="lucide:x"
                    @click="close"
                />
            </div>
        </template>

        <template #body>
            <section class="flex flex-col justify-between gap-2 border-b border-default pb-4 mb-4">
                <!-- <div class="text-sm mb-2"> -->
                <!--   <p class="text-toned">Event Name</p> -->
                <!--   <span class="font-bold">Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit</span> -->
                <!-- </div> -->
                <div class="flex justify-between items-center">
                    <p class="font-mono text-sm">
                        INV/1/1/20260101
                    </p>

                    <div>
                        <UBadge
                            color="success"
                            variant="subtle"
                            label="Order: Success"
                            class="mr-2"
                        />
                        <UBadge
                            color="success"
                            variant="subtle"
                            label="Payment: Paid"
                            class="ml-2"
                        />
                    </div>
                </div>
            </section>

            <section class="border-b border-default pb-4 mb-4">
                <div class="col-span-2 text-sm font-bold text-toned mb-3">
                    CUSTOMER INFORMATION
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div class="text-sm">
                        Name
                    </div>
                    <div class="text-sm text-right font-bold">
                        Ramona
                    </div>

                    <div class="text-sm">
                        Email
                    </div>
                    <div class="text-sm text-right font-bold">
                        ramona@mythag.com
                    </div>
                </div>
            </section>

            <section class="border-b border-default pb-4 mb-4">
                <div class="col-span-2 text-sm font-bold text-toned mb-3">
                    PURCHASED ITEMS
                </div>

                <div class="grid grid-cols-2 gap-4 not-last:mb-4 not-last:pb-4 not-last:border-b not-last:border-default">
                    <div class="col-span-2 flex justify-between items-center text-sm">
                        <p class="font-semibold">
                            Ticket One
                        </p>

                        <UCollapsible>
                            <template #default="{ open }">
                                <UButton
                                    :label="`${open ? 'Hide' : 'Show'} Owner (${3})`"
                                    color="neutral"
                                    size="sm"
                                    variant="subtle"
                                    :trailing-icon="`i-lucide-chevron-${open ? 'up' : 'down'}`"
                                />
                            </template>

                            <template #content>
                                <div class="text-right text-xs font-semibold">
                                    <p class="my-1">
                                        Ramona
                                    </p>
                                    <p class="my-1">
                                        Thais
                                    </p>
                                    <p class="my-1">
                                        Corposant
                                    </p>
                                </div>
                            </template>
                        </UCollapsible>
                    </div>

                    <div class="text-sm">
                        <div class="text-xs text-toned flex justify-between items-end w-[70%]">
                            <span>3 x</span>

                            <div class="text-right flex flex-col">
                                <div class="flex items-center justify-between gap-4">
                                    <p class="line-through">
                                        {{ formatCurrency(1000000) }}
                                    </p>
                                    <UBadge
                                        color="warning"
                                        variant="subtle"
                                        size="sm"
                                        label="50% Off"
                                    />
                                </div>

                                <div class="flex items-center justify-between gap-4">
                                    <p>{{ formatCurrency(500000) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="text-sm text-right font-bold flex flex-col justify-end">
                        {{ formatCurrency(1500000) }}
                    </div>
                </div>
            </section>

            <section class="border-b border-default pb-4 mb-4">
                <div class="grid grid-cols-2 gap-2">
                    <div class="text-sm">
                        Subtotal
                    </div>
                    <div class="text-sm text-right font-bold">
                        {{ formatCurrency(1500000) }}
                    </div>

                    <div class="text-sm">
                        Taxes & Fees
                    </div>
                    <div class="text-sm text-right font-bold">
                        {{ formatCurrency(0) }}
                    </div>

                    <div class="text-2xl font-bold">
                        Total Amount
                    </div>
                    <div class="text-2xl text-right font-bold">
                        {{ formatCurrency(1500000) }}
                    </div>
                </div>
            </section>

            <!-- <section class="flex flex-col justify-center items-center gap-2 border-b border-default pb-4 mb-4"> -->
            <!--   <span class="text-sm text-toned">Total Amount</span> -->
            <!--   <span class="text-4xl font-bold">{{ formatCurrency(1500000) }}</span> -->
            <!-- </section> -->

            <section class="border-b border-default pb-4 mb-4">
                <div class="col-span-2 text-sm font-bold text-toned mb-3">
                    PAYMENT INFORMATION
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div class="text-sm">
                        Payment Method
                    </div>
                    <div class="text-sm text-right font-bold">
                        Virtual Account (BCA VA)
                    </div>

                    <div class="text-sm">
                        Paid Amount
                    </div>
                    <div class="text-sm text-right font-bold">
                        {{ formatCurrency(1500000) }}
                    </div>
                </div>
            </section>

            <section class="my-4">
                <div class="text-sm font-bold text-toned mb-4">
                    ORDER INFORMATION
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div class="text-sm">
                        Ordered At
                    </div>
                    <div class="text-sm text-right font-bold">
                        {{ formatLongDate('2026-07-06T17:16:32+07:00') }}
                    </div>

                    <div class="text-sm">
                        Paid At
                    </div>
                    <div class="text-sm text-right font-bold">
                        {{ formatLongDate('2026-07-06T17:16:32+07:00') }}
                    </div>

                    <div class="text-sm">
                        Purchase Platform
                    </div>
                    <div class="text-sm text-right font-bold">
                        Rawooh Tickets
                    </div>
                </div>
            </section>
        </template>
    </UModal>
</template>
