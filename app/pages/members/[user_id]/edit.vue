<script setup lang="ts">
const route = useRoute()
const { tenantId } = useUserState()
const id = Number(route.params.user_id)

async function useInfo(tId: number, id: number) {
    const { data } = await useFetch(`/api/tenant/${tId}/user/${id}`, {
        transform: res => res.data,
    })
    const member = computed<UserForm>(() => data.value ?? {} as UserForm)

    return { member }
}

const { member } = await useInfo(tenantId.value, id)

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
        <FormMember
            :id="id"
            :fields="member"
        />
    </div>
</template>
