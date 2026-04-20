<script setup lang="ts">
const route = useRoute()
const eventId = Number(route.params.event_id)
const { tenantId } = useUserState()

const { data } = useApi(`/api/tenant/${tenantId.value}/event/${eventId}/detail`, {
    transform: res => ({
        ...res.data,
    }),
})
const event = computed<TenantEvent>(() => data.value ?? {} as TenantEvent)

const settings = ref<SavedSetttings>({
    bgDataUrl: '',
    customBlock: [],
    staticBlock: [],
})

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
    const rawSettings = getLocalStorage<SavedSetttings>(LOCALSTORAGE_CHECK_IN_PREVIEW)
    if (rawSettings) {
        settings.value = rawSettings
    }
})

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
            :md-background="settings.bgDataUrl"
        >
            <PageCheckInMain
                :tenant-id="tenantId"
                :event-id="eventId"
                :custom-block-settings="settings.customBlock"
                :static-block-settings="settings.staticBlock"
                is-preview
            />
        </NuxtLayout>
    </div>
</template>
