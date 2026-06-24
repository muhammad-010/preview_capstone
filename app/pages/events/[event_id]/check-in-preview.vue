<script setup lang="ts">
const route = useRoute()
const eventId = Number(route.params.event_id)
const { tenantId } = useUserState()

const { data } = await useApi(`/api/tenant/${tenantId.value}/event/${eventId}/detail`, {
    transform: res => ({
        ...res.data,
    }),
})
const event = computed<TenantEvent | null>(() => data.value ?? null)
const { data: templateData } = await useApi(`/api/tenant/${tenantId.value}/event/${eventId}/template/find`, {
    transform: res => res.data,
})
const templates = computed(() => templateData.value?.template || [])
const checkInTemplate = computed(() => templates.value.find(item => item.type === TEMPLATE_SCANQR))
const { data: variableData } = await useApi(`/api/tenant/${tenantId.value}/event/${eventId}/template/${checkInTemplate.value?.template_id}/variable`, {
    transform: res => ({
        ...res.data,
    }),
})
const templateVariables = computed(() => variableData.value?.variables || [])
const dynamicBlocks = computed(() => makeDynamicElementBlock(templateVariables.value))

const { data: fontData } = await useApi(`/api/editor/font`, {
    transform: res => ({
        ...res.data,
    }),
})
const fonts = computed(() => fontData.value?.font || [])

const settings = ref<TemplateVariant[]>([])

function getLocalStorage<T>(key: string): T | null {
    if (!import.meta.client) return null

    try {
        const value = localStorage.getItem(key)
        return value ? (JSON.parse(value) as T) : null
    }
    catch {
        return null
    }
}

onMounted(() => {
    settings.value = getLocalStorage<TemplateVariant[]>(LOCALSTORAGE_CHECK_IN_PREVIEW) || []
})

const background = computed<Record<Breakpoint, string | undefined>>(() => {
    const res = {} as Record<Breakpoint, string | undefined>
    if (!settings.value.length) return res

    for (const bp of BREAKPOINTS) {
        const variant = settings.value.find(v => v.slug === bp)
        res[bp] = variant?.background_image_url || undefined
    }

    return res
})
const blocks = computed<{
    customBlocks: ElementBlock[]
    staticBlocks: ElementBlock[]
}>(() => parseTemplateVariants(settings.value, CHECK_IN_VALID_BREAKPOINTS, dynamicBlocks.value))

useHead({
    title: computed(() => `[PREVIEW] Check In - ${event.value ? event.value.name : 'Event'}`),
})
definePageMeta({
    layout: false,
})
</script>

<template>
    <div>
        <NuxtLayout
            name="scan"
            :sm-background="background[BREAKPOINT_SM]"
            :md-background="background[BREAKPOINT_MD]"
            :lg-background="background[BREAKPOINT_LG]"
            :xl-background="background[BREAKPOINT_XL]"
        >
            <PageCheckInMain
                :tenant-id="tenantId"
                :event-id="eventId"
                :dynamic-blocks="dynamicBlocks"
                :custom-block-settings="blocks.customBlocks"
                :static-block-settings="blocks.staticBlocks"
                :valid-fonts="fonts"
                is-preview
            />
        </NuxtLayout>
    </div>
</template>
