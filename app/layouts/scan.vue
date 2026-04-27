<script setup lang="ts">
const colorMode = useColorMode()
colorMode.value = 'light'

const props = useAttrs()

const isBackgroundActive = computed(() => {
    return BREAKPOINTS.some((bp) => {
        return Boolean(props[`${bp}${STYLING_BACKGROUND_SUFFIX}`])
    })
})
const validBreakpoints = computed(() => BREAKPOINTS.filter(bp => Boolean(props[`${bp}${STYLING_BACKGROUND_SUFFIX}`])) || [])
const smallestBackgroundBp = computed(() => {
    return findSmallestBreakpoint(validBreakpoints.value)
})

const backgroundStyleClass = computed<ResponsiveElementSetting>(() => {
    const res: ResponsiveElementSetting = {
        tailwindClass: [],
        style: {},
    }

    const noBreakpoint = validBreakpoints.value.length === 1
    for (const bp of validBreakpoints.value) {
        const {
            key,
            cssVariable,
            tailwindClass,
            getValue,
        } = responsiveStyleClass(bp, STYLING_BACKGROUND_SUFFIX, bp === smallestBackgroundBp.value, noBreakpoint)
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

        <!--
            FOR TRIGGERING TAILWIND SO IT GENERATE CLASSES FROM responsiveStyleClass

        <div
            class="hidden!
                    bg-(image:--sm-background)
                    bg-(image:--md-background)
                    bg-(image:--lg-background)
                    bg-(image:--xl-background)

                    sm:bg-(image:--sm-background)
                    md:bg-(image:--md-background)
                    lg:bg-(image:--lg-background)
                    xl:bg-(image:--xl-background)

                    max-sm:bg-(image:--sm-background)
                    max-md:bg-(image:--md-background)
                    max-lg:bg-(image:--lg-background)
                    max-xl:bg-(image:--xl-background)

                    left-(--sm-pos-x)
                    left-(--md-pos-x)
                    left-(--lg-pos-x)
                    left-(--xl-pos-x)

                    sm:left-(--sm-pos-x)
                    md:left-(--md-pos-x)
                    lg:left-(--lg-pos-x)
                    xl:left-(--xl-pos-x)

                    top-(--sm-pos-y)
                    top-(--md-pos-y)
                    top-(--lg-pos-y)
                    top-(--xl-pos-y)

                    sm:top-(--sm-pos-y)
                    md:top-(--md-pos-y)
                    lg:top-(--lg-pos-y)
                    xl:top-(--xl-pos-y)

                    text-(--sm-color)
                    text-(--md-color)
                    text-(--lg-color)
                    text-(--xl-color)

                    sm:text-(--sm-color)
                    md:text-(--md-color)
                    lg:text-(--lg-color)
                    xl:text-(--xl-color)

                    text-(length:--sm-font-size)
                    text-(length:--md-font-size)
                    text-(length:--lg-font-size)
                    text-(length:--xl-font-size)

                    sm:text-(length:--sm-font-size)
                    md:text-(length:--md-font-size)
                    lg:text-(length:--lg-font-size)
                    xl:text-(length:--xl-font-size)

                    font-(--sm-font-weight)
                    font-(--md-font-weight)
                    font-(--lg-font-weight)
                    font-(--xl-font-weight)

                    sm:font-(--sm-font-weight)
                    md:font-(--md-font-weight)
                    lg:font-(--lg-font-weight)
                    xl:font-(--xl-font-weight)

                    [font-style:--sm-font-style]
                    [font-style:--md-font-style]
                    [font-style:--lg-font-style]
                    [font-style:--xl-font-style]

                    sm:[font-style:--sm-font-style]
                    md:[font-style:--md-font-style]
                    lg:[font-style:--lg-font-style]
                    xl:[font-style:--xl-font-style]

                    w-(--sm-weight)
                    w-(--md-weight)
                    w-(--lg-weight)
                    w-(--xl-weight)

                    sm:w-(--sm-weight)
                    md:w-(--md-weight)
                    lg:w-(--lg-weight)
                    xl:w-(--xl-weight)

                    h-(--sm-height)
                    h-(--md-height)
                    h-(--lg-height)
                    h-(--xl-height)

                    sm:h-(--sm-height)
                    md:h-(--md-height)
                    lg:h-(--lg-height)
                    xl:h-(--xl-height)

                "
        />
        -->
    </UContainer>
</template>
