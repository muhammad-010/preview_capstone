<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()
useHead({
    title: 'Member - Add',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <PageMemberFullForm
            :tenant-id="tenantId"
        />
    </div>
</template>
