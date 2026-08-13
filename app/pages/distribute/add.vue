<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()
useHead({
    title: 'Distribution - Add',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <PageDistributeParticipantFullForm
            :tenant-id="tenantId"
        />
    </div>
</template>
