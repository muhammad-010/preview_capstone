<script setup lang="ts">
const route = useRoute()
const eventId = Number(route.params.event_id)
const { tenantId } = useUserState()

const { data } = useApi(`/api/tenant/${tenantId.value}/event/${eventId}/template/find`, {
    transform: res => res.data,
})
const templates = computed(() => data.value?.template || [])
const invitationTemplate = computed(() => templates.value.find(item => item.type === TEMPLATE_INVITATION))
const template = ref<Template | undefined>()
if (invitationTemplate.value?.template_id) {
    const { data: templateData } = useApi(`/api/tenant/${tenantId.value}/event/${eventId}/template/${invitationTemplate.value?.template_id}`, {
        transform: res => ({
            ...res.data,
        }),
    })
    template.value = templateData.value ?? undefined
}
const {
    customBlocks: selectedCustomBlocks,
    staticBlocks: selectedStaticBlocks,
    breakpoints: selectedBreakpoints,
} = mapTemplateVariantToBlocks(template.value?.variants || [])
const mappedSelectedBreakpoints = computed(() => Object.entries(selectedBreakpoints).map(([key]) => key as Breakpoint))
const canvasSizeOptions = computed(() => CANVAS_SIZE_PRESETS_INVITATION_EMAIL.map((e) => {
    return {
        ...e,
        variantId: selectedBreakpoints[e.id],
    }
}))
const defaultSelectedCanvasSizeIds = computed<Breakpoint[]>(() => mappedSelectedBreakpoints.value.length ? mappedSelectedBreakpoints.value : [BREAKPOINT_MD])
const defaultActiveCanvasSizeId = computed(() => mappedSelectedBreakpoints.value.length ? mappedSelectedBreakpoints.value[0]! : BREAKPOINT_MD)
const defaultOrientation = computed(() => {
    const canvas = CANVAS_SIZE_PRESETS_INVITATION_EMAIL.find(e => e.id === defaultActiveCanvasSizeId.value)
    if (canvas) {
        return canvas.orientation
    }
    else {
        return EDITOR_CANVAS_PORTRAIT
    }
})
const defaultSelectedBlocks = computed(() => [...selectedCustomBlocks, ...selectedStaticBlocks])
const defaultActiveStaticBlocks = computed(() => {
    if (!selectedStaticBlocks.length) {
        return []
    }
    else {
        return selectedStaticBlocks.map(e => e.id)
    }
})

const customBlocks = ref([
    BLOCK_TEXT_DEFAULT,
])

definePageMeta({
    layout: 'clean',
})
</script>

<template>
    <EditorMain
        :editor-mode="EDITOR_MODE_INVITATION_EMAIL"
        :custom-blocks="customBlocks"
        :static-blocks="[]"
        :canvas-size-options="canvasSizeOptions"
        :default-selected-canvas-size-ids="defaultSelectedCanvasSizeIds"
        :default-active-canvas-size-id="defaultActiveCanvasSizeId"
        :default-orientation="defaultOrientation"
        :default-selected-blocks="defaultSelectedBlocks"
        :default-active-static-blocks="defaultActiveStaticBlocks"
        canvas-image-based
        page-title="Digital Invitation Key Visual Editor"
        :default-scale="0.4"
    />
</template>

