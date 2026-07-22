<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const sections = [
    {
        label: 'ORDER INFORMATION',
        slot: 'order-information',
    },
    {
        label: 'PURCHASED ITEMS',
        slot: 'purchased-items',
    },
    {
        label: 'TICKETS OWNER',
        slot: 'tickets-owner',
    },
]
const activeSection = ref(['0'])
watch(open, (newData) => {
    if (!newData) {
        activeSection.value = ['0']
    }
})

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

            <section class="flex flex-col justify-center items-center gap-2 border-b border-default pb-4 mb-4">
                <span class="text-sm text-toned">Total Amount</span>
                <span class="text-4xl font-bold">{{ formatCurrency(1500000) }}</span>
            </section>

            <UAccordion
                v-model="activeSection"
                type="multiple"
                :items="sections"
            >
                <template #order-information>
                    <div class="grid grid-cols-2 gap-2 mb-4">
                        <div class="text-sm">
                            Customer Name
                        </div>
                        <div class="text-sm text-right font-bold">
                            Ramona
                        </div>

                        <div class="text-sm">
                            Customer Email
                        </div>
                        <div class="text-sm text-right font-bold">
                            ramona@mythag.com
                        </div>

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
                </template>

                <template #purchased-items>
                    <div class="grid grid-cols-2 gap-4 not-last:mb-4 not-last:pb-4 not-last:border-b not-last:border-default">
                        <div class="col-span-2 flex justify-between items-center text-sm">
                            <p class="font-semibold">
                                Ticket One
                            </p>
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

                    <div class="grid grid-cols-2 gap-2 mb-4">
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

                        <div class="text-sm">
                            Total Amount
                        </div>
                        <div class="text-sm text-right font-bold">
                            {{ formatCurrency(1500000) }}
                        </div>
                    </div>
                </template>

                <template #tickets-owner>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="text-sm">
                            Ramona
                        </div>
                        <div class="text-sm text-right font-bold">
                            Ticket One
                        </div>

                        <div class="text-sm">
                            Thais
                        </div>
                        <div class="text-sm text-right font-bold">
                            Ticket One
                        </div>

                        <div class="text-sm">
                            Miryam
                        </div>
                        <div class="text-sm text-right font-bold">
                            Ticket One
                        </div>
                    </div>
                </template>
            </UAccordion>
        </template>
    </UModal>
</template>
