<template>
    <UContainer class="flex justify-center items-center flex-col h-screen">
        <div class="mt-12">
            <slot />
        </div>

        <div class="mt-auto mb-12">
            <UColorModeButton />
        </div>
    </UContainer>
</template>
