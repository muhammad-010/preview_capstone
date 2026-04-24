<script setup lang="ts">
const route = useRoute()
const eventId = Number(route.params.event_id)
const { tenantId } = useUserState()

const { data } = useApi(`/api/tenant/${tenantId.value}/event/${eventId}/detail`, {
    transform: res => ({
        ...res.data,
    }),
})
const event = computed<TenantEvent | null>(() => data.value ?? null)

const settings = ref<SavedVariant[]>([])

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
    settings.value = getLocalStorage<SavedVariant[]>(LOCALSTORAGE_CHECK_IN_PREVIEW) || []
})

const background = computed<Record<Breakpoint, string | undefined>>(() => {
    const res = {} as Record<Breakpoint, string | undefined>
    if (!settings.value.length) return res

    for (const bp of BREAKPOINTS) {
        const variant = settings.value.find(v => v.slug === bp)
        res[bp] = variant?.bgImage || undefined
    }

    return res
})
const blocks = computed<{
    customBlocks: ElementBlock[]
    staticBlocks: ElementBlock[]
}>(() => mapSavedVariantToBlocks(settings.value))

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
                :custom-block-settings="blocks.customBlocks"
                :static-block-settings="blocks.staticBlocks"
                is-preview
            />
        </NuxtLayout>
    </div>
</template>
