<script setup lang="ts">
const colorMode = useColorMode()
colorMode.value = 'light'

const settings = ref<SavedSetttings>({
    bgPortraitDataURL: '',
    bgLandscapeDataURL: '',
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
    const rawSettings = getLocalStorage<SavedSetttings>('editor-config')
    if (rawSettings) {
        settings.value = rawSettings
    }
})
</script>

<template>
    <UContainer
        class="relative flex flex-col justify-center items-center h-screen max-w-full overflow-hidden"
    >
        <div
            v-if="settings.bgPortraitDataURL && settings.bgLandscapeDataURL"
            class="absolute inset-0 bg-cover bg-center blur-2xl brightness-75 scale-110"
            :class="['bg-(image:--bg) lg:bg-(image:--lg-bg)']"
            :style="{
                '--bg': `url(${settings.bgPortraitDataURL})`,
                '--lg-bg': `url(${settings.bgLandscapeDataURL})`,
            }"
        />

        <div
            v-else
            class="absolute inset-0 bg-linear-to-br from-blue-200 via-gray-50 to-indigo-200"
        />

        <div
            class="absolute inset-0 bg-contain bg-center bg-no-repeat"
            :class="['bg-(image:--bg) lg:bg-(image:--lg-bg)']"
            :style="{
                '--bg': `url(${settings.bgPortraitDataURL})`,
                '--lg-bg': `url(${settings.bgLandscapeDataURL})`,
            }"
        />

        <div class="z-1">
            <slot />
        </div>
    </UContainer>
</template>
