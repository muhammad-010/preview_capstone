<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const props = defineProps<{
    tenantId: number
    eventId: number
    storeId: number
    productId?: number
    //fields?: TenantEventStoreForm
    isModal?: boolean
}>()
const loading = defineModel<boolean>('loading', { default: false })
//const success = defineModel<boolean>('success', { default: false })
const formRef = useTemplateRef<Form<TenantEventSessionForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}
defineExpose({ saveData })

const isCreate = !props.productId
const schema = z.object({})
type Schema = z.output<typeof schema>

/*
async function addData(payload: FormSubmitEvent<Schema>) {
}

async function editData(payload: FormSubmitEvent<Schema>, id: number) {
}
*/

function submitData(payload: FormSubmitEvent<Schema>) {
    loading.value = true
    if (isCreate) {
        //return addData(payload)
    }
    else {
        //return editData(payload, props.productId)
    }
}
</script>

<template>
    <UForm
        ref="formRef"
        @submit.prevent="submitData"
    >
        <div
            class="grid gap-6"
            :class="isModal ? '' : 'md:grid-cols-2'"
        >
            <UFormField
                label="Product Name"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInput
                    type="text"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Description"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UTextarea
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Product Type"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <USelect
                    readonly
                    disabled
                    class="w-full"
                    :items="[]"
                />
            </UFormField>

            <UFormField
                label="Choose Session"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <USelect
                    multiple
                    readonly
                    disabled
                    class="w-full"
                    :items="[]"
                />
            </UFormField>

            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              :class="`${isModal ? '' : 'my-2'}`"
            >
                <UFormField
                    label="Stock"
                    required
                    :class="`${isModal ? '' : 'my-2'} w-full`"
                >
                    <UInputNumber
                        class="w-full"
                    />
                </UFormField>

                <UFormField
                    label="Product Price"
                    required
                    :class="`${isModal ? '' : 'my-2'} w-full`"
                >
                    <UInputNumber
                        class="w-full"
                    />
                </UFormField>

                <UFormField
                    label="Discount (%)"
                    :class="`${isModal ? '' : 'my-2'} w-full`"
                >
                    <UInputNumber
                        class="w-full"
                    />
                </UFormField>

                <UFormField
                    label="Final Price"
                    required
                    :class="`${isModal ? '' : 'my-2'} w-full`"
                >
                    <UInputNumber
                        readonly
                        disabled
                        :increment="false"
                        :decrement="false"
                        class="w-full"
                    />
                </UFormField>
            </div>

            <UFormField
                label="Product Image"
                description="JPG or PNG, 2MB Max"
                :required="isCreate"
            >
                <UFileUpload
                    highlight
                    label="Click or Drop to add image"
                    color="neutral"
                    accept="image/*"
                    class="min-h-48"
                />
            </UFormField>

            <div
              class="flex gap-6 justify-between"
              :class="`${isModal ? '' : 'my-2'}`"
            >
                <UFormField
                    label="Status"
                    name="is_open"
                    required
                    :class="`${isModal ? '' : 'my-2'}`"
                >
                    <USwitch
                        label="Published"
                    />
                </UFormField>

                <UFormField
                    label="Publish Date"
                    required
                    :class="`${isModal ? '' : 'my-2'} w-full`"
                >
                    <UInput
                        type="text"
                        class="w-full"
                    />
                </UFormField>
            </div>
        </div>
    </UForm>
</template>
