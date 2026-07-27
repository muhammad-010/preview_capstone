<script setup lang="ts">
defineProps<{
  item?: TenantOrder
}>()
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

        <template v-if="item" #body>
            <section class="flex flex-col justify-between gap-2 border-b border-default pb-4 mb-4">
                <!-- <div class="text-sm mb-2"> -->
                <!--   <p class="text-toned">Event Name</p> -->
                <!--   <span class="font-bold">Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit</span> -->
                <!-- </div> -->
                <div class="flex justify-between items-center">
                    <p class="font-mono text-sm">
                        {{ item.invoice }}
                    </p>

                    <div>
                        <UBadge
                            :color="TENANT_ORDER_STATUS_COLORS[item.order_status]"
                            variant="subtle"
                            :label="`Order: ${item.order_status}`"
                            class="mr-2"
                        />
                        <UBadge
                            :color="TENANT_PAYMENT_STATUS_COLORS[item.payment_status]"
                            variant="subtle"
                            :label="`Payment: ${item.payment_status}`"
                            class="ml-2"
                        />
                    </div>
                </div>
            </section>

            <section class="flex flex-col justify-center items-center gap-2 border-b border-default pb-4 mb-4">
                <span class="text-sm text-toned">Total Amount</span>
                <span class="text-4xl font-bold">{{ item.total_price }}</span>
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
                          {{ item.user_name }}
                        </div>

                        <div class="text-sm">
                            Customer Email
                        </div>
                        <div class="text-sm text-right font-bold">
                          {{ item.user_email ?? '-' }}
                        </div>

                        <div class="text-sm">
                            Payment Method
                        </div>
                        <div class="text-sm text-right font-bold">
                          {{ item.payment_method }}
                        </div>

                        <div class="text-sm">
                            Paid Amount
                        </div>
                        <div class="text-sm text-right font-bold">
                          {{ item.payment_amount ?? '-' }}
                        </div>

                        <div class="text-sm">
                            Ordered At
                        </div>
                        <div class="text-sm text-right font-bold">
                            {{ formatLongDate(item.created_at) }}
                        </div>

                        <div class="text-sm">
                            Paid At
                        </div>
                        <div class="text-sm text-right font-bold">
                            {{ item.payment_paid_at ? formatLongDate(item.payment_paid_at) : '-' }}
                        </div>

                        <div class="text-sm">
                            Purchase Platform
                        </div>
                        <div class="text-sm text-right font-bold">
                          {{ item.purchase_platform }}
                        </div>
                    </div>
                </template>

                <template #purchased-items>
                    <div
                      v-if="item.items"
                      v-for="orderItem in item.items"
                      :key="orderItem.id"
                      class="grid grid-cols-2 gap-4 not-last:mb-4 not-last:pb-4 not-last:border-b not-last:border-default"
                    >
                        <div class="col-span-2 flex justify-between items-center text-sm">
                            <p class="font-semibold">
                            {{ orderItem.product_name }}
                            </p>
                        </div>

                        <div class="text-sm">
                            <div class="text-xs text-toned flex justify-between items-end w-[70%]">
                              <span>{{ orderItem.quantity }} x</span>

                                <div class="text-right flex flex-col">
                                    <div
                                      v-if="orderItem.discount_value"
                                      class="flex items-center justify-between gap-4"
                                    >
                                        <p class="line-through">
                                            {{ orderItem.price }}
                                        </p>
                                        <UBadge
                                            color="warning"
                                            variant="subtle"
                                            size="sm"
                                            :label="`${orderItem.discount_value} Off`"
                                        />
                                    </div>

                                    <div class="flex items-center justify-between gap-4">
                                        <p v-if="orderItem.discount_value">{{ orderItem.discounted_price }}</p>
                                        <p v-else>{{ orderItem.price }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="text-sm text-right font-bold flex flex-col justify-end">
                            {{ orderItem.subtotal }}
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 mb-4">
                        <div class="text-sm">
                            Subtotal
                        </div>
                        <div class="text-sm text-right font-bold">
                            {{ item.total_price }}
                        </div>

                        <div class="text-sm">
                            Taxes & Fees
                        </div>
                        <div class="text-sm text-right font-bold">
                            {{ item.fee_amount ?? '-' }}
                        </div>

                        <div class="text-sm">
                            Total Amount
                        </div>
                        <div class="text-sm text-right font-bold">
                            {{ item.payment_amount ?? '-' }}
                        </div>
                    </div>
                </template>

                <template #tickets-owner>
                    <template
                      v-if="item.items"
                      v-for="orderItem in item.items"
                    >
                        <div
                          v-for="ticket in orderItem.tickets"
                          :key="ticket.id"
                          class="grid grid-cols-2 gap-2"
                        >
                            <div class="text-sm">
                              {{ ticket.name }}
                            </div>
                            <div class="text-sm text-right font-bold">
                              {{ orderItem.product_name }}
                            </div>
                        </div>
                    </template>
                </template>
            </UAccordion>
        </template>
    </UModal>
</template>
