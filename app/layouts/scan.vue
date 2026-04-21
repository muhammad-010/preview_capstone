<script setup lang="ts">
const colorMode = useColorMode()
colorMode.value = 'light'

const props = useAttrs()

const isBackgroundActive = computed(() => {
    return Boolean(props[LAYOUT_ATTRS_SM_BACKGROUND])
        || Boolean(props[LAYOUT_ATTRS_MD_BACKGROUND])
        || Boolean(props[LAYOUT_ATTRS_LG_BACKGROUND])
        || Boolean(props[LAYOUT_ATTRS_XL_BACKGROUND])
})

const backgroundStyleClass = computed<ResponsiveElementSetting>(() => {
    const res: ResponsiveElementSetting = {
        tailwindClass: [],
        style: {},
    }

    for (const [bp, cfg] of Object.entries(LAYOUT_ATTRS_BACKGROUNDS)) {
        const prop = props[`${bp}${LAYOUT_ATTRS_BACKGROUND_SUFFIX}`]
        if (prop) {
            res.style[cfg.cssVar] = `url(${prop})`
            res.tailwindClass.push(`${cfg.twPrefix}bg-(${cfg.cssVar})`)
        }
    }

    return res
})
</script>

<template>
    <UContainer
        class="relative flex flex-col justify-center items-center h-screen max-w-full overflow-hidden"
    >
        <div
            v-if="isBackgroundActive"
            class="absolute inset-0 bg-cover bg-center blur-2xl brightness-75 scale-110"
            :class="backgroundStyleClass.tailwindClass"
            :style="backgroundStyleClass.style"
        />

        <div
            v-else
            class="absolute inset-0 bg-linear-to-br from-blue-200 via-gray-50 to-indigo-200"
        />

        <div
            v-if="isBackgroundActive"
            class="absolute inset-0 bg-contain bg-center bg-no-repeat"
            :class="backgroundStyleClass.tailwindClass"
            :style="backgroundStyleClass.style"
        />

        <div class="z-1">
            <slot />
        </div>
    </UContainer>
</template>
