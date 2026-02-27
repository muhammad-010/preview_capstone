<template>
    <UContainer class="flex justify-center items-center flex-col h-screen">
        <NuxtImg
            src="/logo.png"
            :width="325"
        />
        <div class="text-center mb-8">
            <!-- <h2>{{ APP_NAME }}</h2> -->
            <small>Enterprise Event Management Platform</small>
        </div>

        <slot />

        <div class="mt-12">
            <UColorModeButton />
        </div>
    </UContainer>
</template>
