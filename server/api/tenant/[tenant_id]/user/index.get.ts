export default defineEventHandler(async (event): Promise<TenantMemberListresult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const path = `/tenant/${tenantId}/user`
    const query = getQuery(event)

    const res: TenantMemberListresult = await api(event, method, path, {
        query,
    })
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
