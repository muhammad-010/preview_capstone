<script setup lang="ts">
const route = useRoute()
useHead({
    title: 'Member - Add',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <PageMemberForm />
    </div>
</template>
