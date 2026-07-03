<script setup lang="ts">
/**
 * First-open prompt shown when the design still uses the default background.
 * Offers to upload a custom background (PNG/JPG/JPEG, max 1MB), reusing the
 * editor's existing background-upload flow (writes the active canvas background).
 */
const open = defineModel<boolean>('open')
const ctx = useEditorV2Context()
const toast = useToast()

const ACCEPT = 'image/png,image/jpeg'
const ALLOWED_TYPES = ['image/png', 'image/jpeg']

const file = ref<File>()
const uploading = ref(false)

watch(file, async (f) => {
    if (!f) return
    if (!ALLOWED_TYPES.includes(f.type)) {
        toast.add({ title: 'Unsupported Format', description: 'Only PNG, JPG, or JPEG images are allowed', color: 'error' })
        file.value = undefined
        return
    }
    uploading.value = true
    await ctx.uploadBackground(f)
    uploading.value = false
    file.value = undefined
    open.value = false
})
</script>

<template>
    <UModal
        v-model:open="open"
        title="Upload Background Image"
        :ui="{ footer: 'justify-end' }"
    >
        <template #body>
            <div class="space-y-3 text-sm">
                <p>
                    <b>This design is still using the default background. Would you like to upload your own background image?</b>
                    <br>
                    Note: The background image will serve as the canvas, including its dimensions.
                </p>
                <UAlert
                    color="neutral"
                    variant="soft"
                    icon="lucide:info"
                    title="Requirements"
                    description="Max file size 1 MB. Allowed formats: PNG, JPG, or JPEG."
                />
            </div>
        </template>

        <template #footer="{ close }">
            <UButton
                label="Keep Default"
                color="neutral"
                variant="outline"
                :disabled="uploading"
                @click="close"
            />
            <UFileUpload
                v-slot="{ open: openPicker }"
                v-model="file"
                :accept="ACCEPT"
            >
                <UButton
                    label="Upload Image"
                    icon="lucide:upload"
                    :loading="uploading"
                    @click="openPicker()"
                />
            </UFileUpload>
        </template>
    </UModal>
</template>
