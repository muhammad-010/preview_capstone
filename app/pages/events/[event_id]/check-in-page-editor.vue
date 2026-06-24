<script setup lang="ts">
const route = useRoute()
const eventId = Number(route.params.event_id)
const { tenantId } = useUserState()

const { data } = await useApi(`/api/tenant/${tenantId.value}/event/${eventId}/template/find`, {
    transform: res => res.data,
})
const templates = computed(() => data.value?.template || [])
const checkInTemplate = computed(() => templates.value.find(item => item.type === TEMPLATE_SCANQR))
const { data: templateData, refresh } = await useApi(`/api/tenant/${tenantId.value}/event/${eventId}/template/${checkInTemplate.value?.template_id}`, {
    transform: res => ({
        ...res.data,
    }),
})
const template = computed(() => templateData.value)
const { data: variableData } = await useApi(`/api/tenant/${tenantId.value}/event/${eventId}/template/${checkInTemplate.value?.template_id}/variable`, {
    transform: res => ({
        ...res.data,
    }),
})
const templateVariables = computed(() => variableData.value?.variables || [])
const validBreakpoints = CANVAS_SIZE_PRESETS_CHECK_IN_PAGE.map(e => e.id) as Breakpoint[]
const dynamicBlocks = computed(() => makeDynamicElementBlock(templateVariables.value))
const {
    customBlocks: selectedCustomBlocks,
    staticBlocks: selectedStaticBlocks,
    breakpoints: selectedBreakpoints,
    backgroundImages: selectedBackgroundImages,
} = editorParseTemplateVariants(template.value?.variants || [], validBreakpoints, dynamicBlocks.value)
const mappedSelectedBreakpoints = computed(() => Object.entries(selectedBreakpoints).map(([key]) => key as Breakpoint))
const canvasSizeOptions = computed(() => CANVAS_SIZE_PRESETS_CHECK_IN_PAGE.map(e => ({ ...e, variantId: selectedBreakpoints[e.id] })))
const defaultSelectedCanvasSizeIds = computed<Breakpoint[]>(() => mappedSelectedBreakpoints.value.length ? mappedSelectedBreakpoints.value : [BREAKPOINT_MD])
const defaultActiveCanvasSizeId = computed(() => mappedSelectedBreakpoints.value.length ? mappedSelectedBreakpoints.value[0]! : BREAKPOINT_MD)
const defaultOrientation = computed(() => {
    const canvas = CANVAS_SIZE_PRESETS_CHECK_IN_PAGE.find(e => e.id === defaultActiveCanvasSizeId.value)
    return canvas ? canvas.orientation : EDITOR_CANVAS_PORTRAIT
})
const defaultSelectedBlocks = computed(() => [...selectedCustomBlocks, ...selectedStaticBlocks])
const defaultActiveStaticBlocks = computed(() => selectedStaticBlocks.length ? selectedStaticBlocks.map(e => e.id) : [])
const defaultBackgroundImages = computed(() => {
    const backgroundImages = cloneObject(selectedBackgroundImages)
    for (const bp of validBreakpoints) {
        if (!backgroundImages[bp]) {
            backgroundImages[bp] = {
                dataUrl: '',
                uploadKey: '',
                width: 0,
                height: 0,
            }
        }
    }
    return backgroundImages
})
const { data: fontData } = await useApi(`/api/editor/font`, {
    transform: res => ({
        ...res.data,
    }),
})
const fonts = computed(() => fontData.value?.font || [])



const customBlocks = ref([
    BLOCK_TEXT_DEFAULT,
    ...dynamicBlocks.value,
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
        :tenant-id="tenantId"
        :event-id="eventId"
        :template-id="template?.template_id"
        :custom-blocks="customBlocks"
        :static-blocks="staticBlocks"
        :canvas-size-options="canvasSizeOptions"
        :font-options="fonts"
        :default-selected-canvas-size-ids="defaultSelectedCanvasSizeIds"
        :default-active-canvas-size-id="defaultActiveCanvasSizeId"
        :default-orientation="defaultOrientation"
        :default-selected-blocks="defaultSelectedBlocks"
        :default-active-static-blocks="defaultActiveStaticBlocks"
        :default-background-images="defaultBackgroundImages"
        with-preview
        :html-preview-fn="getCheckInPageHtml"
        :preview-path="`/events/${eventId}/check-in-preview`"
        :preview-key="LOCALSTORAGE_CHECK_IN_PREVIEW"
        page-title="Check In Page Key Visual Editor"
        @refresh="refresh"
    />
</template>
