<script setup lang="ts">
import type { Form, FormSubmitEvent, SelectItem } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { errorToast } = useErrorToast()
const props = defineProps<{
    tenantId: number
    eventId: number
    storeId: number
    productId?: number
    fields?: TenantEventStoreProductForm
    isModal?: boolean
}>()
const loading = defineModel<boolean>('loading', { default: false })
const success = defineModel<boolean>('success', { default: false })
const formRef = useTemplateRef<Form<TenantEventSessionForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}
defineExpose({ saveData })

const productTypes = ref<SelectItem[]>(STORE_PRODUCT_TYPES)

const isCreate = !props.productId
const bannerSchema = z
    .instanceof(File, { message: 'Please select an image file' })
    .refine(file => ['image/jpg', 'image/jpeg', 'image/png'].includes(file.type), { message: 'Please upload valid image (JPG or PNG)' })
    .refine(file => file.size <= (2 * 1024 * 1024), { message: 'Max file size are 2MB' })
const schema = z.object({
    name: zodStringRequired('Product name is required'),
    description: zodStringRequired('Product name is required'),
    price: zodNumberRequired(),
    discount_value: zodNumberRequired(),
    stock: zodNumberRequired().int().gt(0),
    status: zodEnum(['active', 'inactive']),
    sale_start_at: zodISODatetime().optional(),
    banner_image: isCreate ? bannerSchema : bannerSchema.optional(),
    product_type: zodStringOptional(),
    raw_items: z.array(z.any()).min(1, 'At least one item'),
    attributes: z.array(z.number()),
})
    .superRefine((data, ctx) => {
        if (data.status !== 'active') return

        if (!data.sale_start_at) {
            ctx.addIssue({
                code: 'custom',
                path: ['sale_start_at'],
                message: 'Sale date are required if published',
            })
            return
        }
    })
type Schema = z.output<typeof schema>

const defaultSaleStart = new Date()
defaultSaleStart.setSeconds(0, 0)
function createState(): TenantEventStoreProductForm {
    if (props.fields) return cloneObject(props.fields)
    return {
        name: '',
        description: '',
        price: 0,
        discount_value: 0,
        stock: 0,
        status: 'inactive',
        banner_image: undefined,
        sale_start_at: defaultSaleStart.toISOString(),
        items: [],
        raw_items: [],
        attributes: [],
        product_type: STORE_PRODUCT_TYPE_SCHEDULED_SESSION,
    }
}
type PartialExceptStatus
    = Partial<Omit<TenantEventStoreProductForm, 'status'>>
        & Pick<TenantEventStoreProductForm, 'status'>
const state = reactive<PartialExceptStatus>(createState())

const statusSwitch = computed({
    get: () => state.status === 'active',
    set: (value: boolean) => {
        state.status = value ? 'active' : 'inactive'
    },
})

const {
    data: productItemsData,
    status: productItemsStatus,
    execute: getProductItems,
    refresh: refreshProductItems,
} = await useLazyApi(`/api/tenant/${props.tenantId}/event/${props.eventId}/store/${props.storeId}/product/item`, {
    query: {
        type: state.product_type || STORE_PRODUCT_TYPE_SCHEDULED_SESSION,
    },
    transform: res => ({
        item: res.data.item.map(e => ({ ...e, fe_uid: `${e.reference_type}-${e.reference_id}` })),
    }),
    immediate: Boolean(state.raw_items?.length),
})
const productItems = computed(() => productItemsData.value?.item || [])

function onOpenProductItems() {
    if (!productItems.value.length) {
        getProductItems()
    }
}

watch(() => state.product_type, (newVal, oldVal) => {
    if (newVal !== oldVal) {
        state.raw_items = cloneObject([])
        refreshProductItems()
    }
})

function parseRawProductItems(raw: string[]): TenantEventStoreProductItem[] {
    const res: TenantEventStoreProductItem[] = []
    for (let i = 0; i < raw.length; i++) {
        const fe_uid = raw[i]!
        const item = productItems.value.find(e => e.fe_uid && e.fe_uid === fe_uid)
        if (!item) continue

        res.push({ reference_type: item.reference_type, reference_id: item.reference_id })
    }
    return res
}

const attributeListPage = ref(1)
const attributeListSearch = ref('')
const attributeListQuery = ref('')
const attributeListHasMore = ref(true)
const {
    data: attributeListData,
    status: attributeListStatus,
    execute: getAttributeList,
} = await useLazyApi(`/api/tenant/${props.tenantId}/event/${props.eventId}/attribute`, {
    query: computed(() => {
        return {
            query: attributeListQuery.value,
            page: attributeListPage.value,
            limit: 10,
        }
    }),
    transform: res => res.data,
    immediate: Boolean(state.attributes?.length),
})
const attributeList = ref<CustomAttribute[]>([])
watch(attributeListData, (newData) => {
    if (newData) {
        attributeList.value.push(...newData.custom_attribute)
        attributeListHasMore.value = attributeList.value.length < newData.total_data
    }
})
watch(attributeListPage, () => {
    getAttributeList()
})
watch(attributeListSearch, (newData, oldData) => {
    if (attributeListStatus.value == 'pending') return

    const query
        = newData.length >= 3
            ? newData
            : oldData.length > newData.length && attributeListQuery.value !== ''
                ? ''
                : null

    if (query === null) return

    attributeList.value = []
    attributeListQuery.value = query
    if (attributeListPage.value === 1) {
        getAttributeList()
    }
    else {
        attributeListPage.value = 1
    }
})

const attributesSelectMenu = useTemplateRef('selectMenuRef')
let removeAttributesSelectListener: (() => void) | null = null

function attachScrollAttributesSelectMenu() {
    nextTick(() => {
        const viewport = attributesSelectMenu.value?.viewportRef
        if (!viewport) return

        const onScroll = () => {
            if (attributeListStatus.value === 'pending') return

            const threshold = 100
            if ((viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - threshold) && attributeListHasMore.value) {
                attributeListPage.value++
            }
        }

        viewport.addEventListener('scroll', onScroll)
        removeAttributesSelectListener = () => {
            viewport.removeEventListener('scroll', onScroll)
        }
    })
}

function onOpenAttributes(open: boolean) {
    if (!open) {
        removeAttributesSelectListener?.()
        return
    }

    if (!attributeList.value.length) {
        getAttributeList()
    }

    attachScrollAttributesSelectMenu()
}

onBeforeUnmount(() => removeAttributesSelectListener?.())

const finalPrice = computed(() => {
    if (!state.price) {
        return 0
    }
    else if (!state.discount_value) {
        return state.price
    }

    return state.price * (100 - state.discount_value) / 100
})

const uploadKey = ref('')
async function uploadImage(file: File) {
    const body = new FormData()
    body.append('file', file)
    try {
        const data = await $api(`/api/upload/media`, {
            method: 'POST',
            body,
        })
        if (data.success) {
            successToast({ description: 'Background image uploaded' })
            uploadKey.value = data.data.upload_key
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to upload banner image' })
    }
}

async function addData(payload: FormSubmitEvent<Schema>) {
    try {
        await uploadImage(payload.data.banner_image!)
        if (!uploadKey.value) return

        const body: TenantEventStoreProductForm = {
            name: payload.data.name,
            description: payload.data.description,
            product_image_upload_key: uploadKey.value,
            stock: payload.data.stock,
            price: payload.data.price,
            discount_value: payload.data.discount_value || 0,
            status: payload.data.status as StoreProductStatus,
            items: [],
            attributes: [...payload.data.attributes],
        }

        if (payload.data.status === 'active') {
            body.sale_start_at = payload.data.sale_start_at
        }

        if (payload.data.raw_items.length) {
            body.items = parseRawProductItems(payload.data.raw_items)
        }

        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/store/${props.storeId}/product`, {
            method: 'POST',
            body,
        })
        if (data.success) {
            successToast({ description: 'New product has been created' })
            success.value = true
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to create new product' })
    }
    finally {
        uploadKey.value = ''
    }
}

async function editData(payload: FormSubmitEvent<Schema>, productId: number) {
    try {
        const body: TenantEventStoreProductForm = {
            name: payload.data.name,
            description: payload.data.description,
            stock: payload.data.stock,
            price: payload.data.price,
            discount_value: payload.data.discount_value || 0,
            status: payload.data.status as StoreProductStatus,
            items: [],
            attributes: [...payload.data.attributes],
        }

        if (payload.data.status === 'active') {
            body.sale_start_at = payload.data.sale_start_at
        }

        if (payload.data.raw_items.length) {
            body.items = parseRawProductItems(payload.data.raw_items)
        }

        if (payload.data.banner_image) {
            await uploadImage(payload.data.banner_image!)
            if (!uploadKey.value) return
            body.product_image_upload_key = uploadKey.value
        }

        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/store/${props.storeId}/product/${productId}`, {
            method: 'PUT',
            body,
        })
        if (data.success) {
            successToast({ description: 'A product has been updated' })
            success.value = true
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to update product' })
    }
    finally {
        uploadKey.value = ''
    }
}

function submitData(payload: FormSubmitEvent<Schema>) {
    loading.value = true
    if (isCreate) {
        return addData(payload)
    }
    else {
        return editData(payload, props.productId)
    }
}
</script>

<template>
    <UForm
        ref="formRef"
        :schema="schema"
        :state="state"
        @submit.prevent="submitData"
    >
        <div
            class="grid gap-6"
            :class="isModal ? '' : 'md:grid-cols-2'"
        >
            <UFormField
                label="Product Name"
                name="name"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInput
                    v-model="state.name"
                    type="text"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Description"
                name="description"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UTextarea
                    v-model="state.description"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Product Type"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <USelect
                    v-model="state.product_type"
                    readonly
                    disabled
                    class="w-full"
                    :items="productTypes"
                />
            </UFormField>

            <UFormField
                label="Choose Included Items"
                name="items"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <USelectMenu
                    v-model="state.raw_items"
                    :loading="productItemsStatus === 'pending'"
                    multiple
                    class="w-full"
                    label-key="name"
                    value-key="fe_uid"
                    :items="productItems"
                    @update:open="onOpenProductItems"
                />
            </UFormField>

            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6"
                :class="`${isModal ? '' : 'my-2'}`"
            >
                <UFormField
                    label="Stock"
                    name="stock"
                    required
                    :class="`${isModal ? '' : 'my-2'} w-full col-span-1 md:col-span-2`"
                >
                    <UInputNumber
                        v-model="state.stock"
                        :min="0"
                        class="w-full"
                    />
                </UFormField>

                <UFormField
                    label="Price"
                    name="price"
                    required
                    :class="`${isModal ? '' : 'my-2'} w-full col-span-1 md:col-span-2`"
                >
                    <UInputNumber
                        v-model="state.price"
                        :min="0"
                        class="w-full"
                        :format-options="{
                            style: 'currency',
                            currency: 'IDR',
                            currencyDisplay: 'symbol',
                            maximumFractionDigits: 0,
                        }"
                    />
                </UFormField>

                <UFormField
                    label="Discount (%)"
                    name="discount_value"
                    :class="`${isModal ? '' : 'my-2'} w-full`"
                >
                    <UInputNumber
                        v-model="state.discount_value"
                        :min="0"
                        :max="100"
                        class="w-full"
                    />
                </UFormField>

                <UFormField
                    label="Final Price"
                    :class="`${isModal ? '' : 'my-2'} w-full col-span-1 md:col-span-2`"
                >
                    <UInputNumber
                        v-model="finalPrice"
                        readonly
                        disabled
                        :increment="false"
                        :decrement="false"
                        class="w-full"
                        :format-options="{
                            style: 'currency',
                            currency: 'IDR',
                            currencyDisplay: 'symbol',
                            maximumFractionDigits: 0,
                        }"
                    />
                </UFormField>
            </div>

            <div
                class="flex gap-6 justify-between"
                :class="`${isModal ? '' : 'my-2'}`"
            >
                <UFormField
                    label="Status"
                    name="status"
                    required
                    :class="`${isModal ? '' : 'my-2'}`"
                >
                    <USwitch
                        v-model="statusSwitch"
                        :label="state.status === 'active' ? 'Published' : 'Unpublished'"
                    />
                </UFormField>

                <UFormField
                    v-if="state.status === 'active'"
                    label="Sale Date"
                    name="sale_start_at"
                    required
                    :class="`${isModal ? '' : 'my-2'} w-full`"
                >
                    <InputDateTime
                        v-model="state.sale_start_at"
                    />
                </UFormField>
            </div>

            <UFormField
                label="Attributes"
                name="attributes"
                :class="`${isModal ? '' : 'my-2'}`"
            >
                <USelectMenu
                    ref="selectMenuRef"
                    v-model="state.attributes"
                    v-model:search-term="attributeListSearch"
                    :loading="attributeListStatus === 'pending'"
                    multiple
                    class="w-full"
                    label-key="name"
                    value-key="custom_attribute_id"
                    :items="attributeList"
                    @update:open="onOpenAttributes"
                />
            </UFormField>

            <UFormField
                label="Product Image"
                name="banner_image"
                description="JPG or PNG, 2MB Max"
                :required="isCreate"
            >
                <UFileUpload
                    v-model="state.banner_image"
                    highlight
                    label="Click or Drop to add image"
                    color="neutral"
                    accept="image/*"
                    class="min-h-48"
                />
            </UFormField>
        </div>
    </UForm>
</template>
