<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()

useHead({
    title: 'Distribute',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {}))
</script>

<template>
    <div class="my-8">
        <PageDistributeParticipantList
            :tenant-id="tenantId"
        />
    </div>
</template>
