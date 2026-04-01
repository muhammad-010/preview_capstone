<script setup lang="ts">
const route = useRoute()
useHead({
    title: 'Event - Add',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <PageEventForm />
    </div>
</template>
