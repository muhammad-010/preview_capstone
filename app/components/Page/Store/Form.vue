<script setup lang="ts">
import type { Form, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { $api } = useNuxtApp()
const { successToast } = useSuccessToast()
const { isFetchError, errorToast } = useErrorToast()
const props = defineProps<{
    tenantId: number
    eventId: number
    storeId?: number
    fields?: TenantEventStoreForm
    isModal?: boolean
}>()
const loading = defineModel<boolean>('loading', { default: false })
const success = defineModel<boolean>('success', { default: false })
const formRef = useTemplateRef<Form<TenantEventSessionForm>>('formRef')
async function saveData() {
    await formRef.value?.submit()
}
defineExpose({ saveData })

const isCreate = !props.storeId
const bannerSchema = z
    .instanceof(File, { message: 'Please select an image file' })
    .refine(file => ['image/jpg', 'image/jpeg', 'image/png'].includes(file.type), { message: 'Please upload valid image (JPG or PNG)' })
    .refine(file => file.size <= (2 * 1024 * 1024), { message: 'Max file size are 2MB' })
const schema = z.object({
    title: zodStringRequired('Store banner is required'),
    subtitle: zodStringRequired('Store tagline is required'),
    is_open: zodBooleanRequired(),
    banner_image: isCreate ? bannerSchema : bannerSchema.optional(),
    slug: zodStringRequired('Store slug is required').min(3),
}).superRefine(async ({ slug }, ctx) => {
    if (props.fields) {
        if (slug === props.fields.slug) return
    }

    try {
        const data = await $api(`/api/store/validate/slug`, {
            method: 'POST',
            body: { slug },
        })
        if (!data.success) {
            ctx.addIssue({
                code: 'custom',
                message: data.message || 'Error on field slug',
                path: ['slug'],
            })
        }
    }
    catch (error) {
        if (isFetchError(error) && error.response && error.response._data) {
            ctx.addIssue({
                code: 'custom',
                message: error.response._data.data.message || 'Error on field slug',
                path: ['slug'],
            })
        }
    }
})
type Schema = z.output<typeof schema>

function createState(): TenantEventStoreForm {
    if (props.fields) return cloneObject(props.fields)
    return {
        title: '',
        subtitle: '',
        slug: '',
        is_open: false,
        banner_image: undefined,
    }
}
const state = reactive<Partial<TenantEventStoreForm>>(createState())

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

        const body: TenantEventStoreForm = {
            title: payload.data.title,
            subtitle: payload.data.subtitle,
            slug: payload.data.slug,
            image_upload_key: uploadKey.value,
            is_open: payload.data.is_open,
        }

        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/store`, {
            method: 'POST',
            body,
        })
        if (data.success) {
            successToast({ description: 'New store has been created' })
            success.value = true
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to create new store' })
    }
    finally {
        uploadKey.value = ''
    }
}

async function editData(payload: FormSubmitEvent<Schema>, storeId: number) {
    try {
        const body: TenantEventStoreForm = {
            title: payload.data.title,
            subtitle: payload.data.subtitle,
            is_open: payload.data.is_open,
        }

        if (props.fields && props.fields.slug && props.fields.slug !== payload.data.slug) {
            body.slug = payload.data.slug
        }
        if (payload.data.banner_image) {
            await uploadImage(payload.data.banner_image!)
            if (!uploadKey.value) return
            body.image_upload_key = uploadKey.value
        }

        const data = await $api(`/api/tenant/${props.tenantId}/event/${props.eventId}/store/${storeId}`, {
            method: 'PUT',
            body,
        })
        if (data.success) {
            successToast({ description: 'A store has been updated' })
            success.value = true
        }
        else {
            errorToast({ description: data.message })
        }
    }
    catch (error) {
        errorToast({ error, description: 'Failed to update store' })
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
        return editData(payload, props.storeId)
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
                label="Heading"
                name="title"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UInput
                    v-model="state.title"
                    type="text"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Tagline"
                name="subtitle"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UTextarea
                    v-model="state.subtitle"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Banner Image"
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

            <UFormField
                label="Slug"
                name="slug"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <UFieldGroup class="w-full">
                    <UBadge
                        color="neutral"
                        variant="outline"
                        size="lg"
                        icon="lucide:link"
                        label="store.rawooh.com/"
                        class="rounded-l-lg! rounded-r-none!"
                    />
                    <UInput
                        v-model="state.slug"
                        type="text"
                        class="w-full"
                    />
                </UFieldGroup>
            </UFormField>

            <UFormField
                label="Status"
                name="is_open"
                required
                :class="`${isModal ? '' : 'my-2'} w-full`"
            >
                <USwitch
                    v-model="state.is_open"
                    :label="state.is_open ? 'Open' : 'Close'"
                />
            </UFormField>
        </div>
    </UForm>
</template>
