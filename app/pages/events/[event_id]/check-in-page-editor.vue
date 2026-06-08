<script setup lang="ts">
const route = useRoute()
const eventId = Number(route.params.event_id)
const { tenantId } = useUserState()

const { data } = useApi(`/api/tenant/${tenantId.value}/event/${eventId}/template/find`, {
    transform: res => res.data,
})
const templates = computed(() => data.value?.template || [])
const checkInTemplate = computed(() => templates.value.find(item => item.type === TEMPLATE_SCANQR))
const template = ref<Template | undefined>()
if (checkInTemplate.value?.template_id) {
    const { data: templateData } = useApi(`/api/tenant/${tenantId.value}/event/${eventId}/template/${checkInTemplate.value?.template_id}`, {
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
const defaultSelectedCanvasSizeIds = computed<Breakpoint[]>(() => selectedBreakpoints.length ? selectedBreakpoints : [BREAKPOINT_MD])
const defaultActiveCanvasSizeId = computed(() => selectedBreakpoints.length ? selectedBreakpoints[0]! : BREAKPOINT_MD)
const defaultOrientation = computed(() => {
    const canvas = CANVAS_SIZE_PRESETS_CHECK_IN_PAGE.find(e => e.id === defaultActiveCanvasSizeId.value)
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
const staticBlocks = ref([
    STATIC_BLOCK_SCANNER_QR,
    STATIC_BLOCK_INPUT_CARD,
])

definePageMeta({
    layout: 'clean',
})
</script>

<template>
    <EditorMain
        :editor-mode="EDITOR_MODE_CHECK_IN_PAGE"
        :custom-blocks="customBlocks"
        :static-blocks="staticBlocks"
        :canvas-size-options="CANVAS_SIZE_PRESETS_CHECK_IN_PAGE"
        :default-selected-canvas-size-ids="defaultSelectedCanvasSizeIds"
        :default-active-canvas-size-id="defaultActiveCanvasSizeId"
        :default-orientation="defaultOrientation"
        :default-selected-blocks="defaultSelectedBlocks"
        :default-active-static-blocks="defaultActiveStaticBlocks"
        with-preview
        :html-preview-fn="checkInPageHtml"
        :preview-path="`/events/${eventId}/check-in-preview`"
        :preview-key="LOCALSTORAGE_CHECK_IN_PREVIEW"
        page-title="Check In Page Key Visual Editor"
    />
</template>

