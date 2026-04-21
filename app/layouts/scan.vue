<script setup lang="ts">
const colorMode = useColorMode()
colorMode.value = 'light'

const props = useAttrs()

const isBackgroundActive = computed(() => {
    return BREAKPOINTS.some((bp) => {
        return Boolean(props[`${bp}${STYLING_BACKGROUND_SUFFIX}`])
    })
})

const backgroundStyleClass = computed<ResponsiveElementSetting>(() => {
    const res: ResponsiveElementSetting = {
        tailwindClass: [],
        style: {},
    }

    for (const bp of BREAKPOINTS) {
        const {
            key,
            cssVariable,
            tailwindClass,
            getValue,
        } = responsiveStyleClass(bp, STYLING_BACKGROUND_SUFFIX)
        const prop = props[key]
        if (prop) {
            res.style[cssVariable] = getValue(prop)
            res.tailwindClass.push(tailwindClass)
        }
    }

    return res
})
</script>

<template>
    <UContainer
        class="relative flex flex-col justify-center items-center h-screen max-w-full overflow-hidden"
    >
        <!--
            FOR TRIGGERING TAILWIND SO IT GENERATE CLASSES FROM responsiveStyleClass
            <div class="hidden sm:bg-(image:--sm-background) md:bg-(image:--md-background) lg:bg-(image:--lg-background) xl:bg-(image:--xl-background)" />
        -->

        <div
            v-if="isBackgroundActive"
            class="absolute inset-0 bg-cover bg-center blur-2xl brightness-75 scale-110"
            :style="backgroundStyleClass.style"
            :class="backgroundStyleClass.tailwindClass"
        />

        <div
            v-else
            class="absolute inset-0 bg-linear-to-br from-blue-200 via-gray-50 to-indigo-200"
        />

        <div
            v-if="isBackgroundActive"
            class="absolute inset-0 bg-contain bg-center bg-no-repeat"
            :style="backgroundStyleClass.style"
            :class="backgroundStyleClass.tailwindClass"
        />

        <div class="z-1">
            <slot />
        </div>
    </UContainer>
</template>
