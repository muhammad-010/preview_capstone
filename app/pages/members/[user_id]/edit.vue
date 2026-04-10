<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()
const userId = Number(route.params.user_id)
const { member } = await useMemberInfo(tenantId.value, userId)

useHead({
    title: 'Member - Edit',
})
setLayoutPropState(buildLayoutProp(APP_ROUTES, route.path, {
    [':user_id']: {
        param: route.params.user_id as string,
        label: member.value.name,
    },
}))
</script>

<template>
    <div class="my-8">
        <PageMemberFullForm
            v-model:fields="member"
            v-model:id="userId"
            :tenant-id="tenantId"
        />
    </div>
</template>
