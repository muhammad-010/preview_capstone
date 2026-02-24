export default defineEventHandler(async (event): Promise<TenantMemberFormResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const userId = getRouterParam(event, 'user_id')
    const path = `/tenant/${tenantId}/user/${userId}`

    const rawres: TenantMemberDetailResult = await api(event, method, path, {})
    const res = {
        ...rawres,
        data: userToUserForm(rawres.data),
    }
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
