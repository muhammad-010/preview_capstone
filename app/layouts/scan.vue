<template>
    <UContainer class="flex justify-center items-center flex-col h-screen">
        <div class="mb-auto mt-12">
            <UColorModeButton />
        </div>

        <div class="mb-12">
            <slot />
        </div>
    </UContainer>
</template>
