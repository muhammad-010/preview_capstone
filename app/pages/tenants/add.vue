<script setup lang="ts">
const route = useRoute()
useHead({
    title: 'Tenant - Add',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <FormTenant />
    </div>
</template>
