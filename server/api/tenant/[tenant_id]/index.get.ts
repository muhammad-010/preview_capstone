export default defineEventHandler(async (event): Promise<TenantFormResult> => {
    const method = 'GET'
    const tenantId = getRouterParam(event, 'tenant_id')
    const path = `/tenant/${tenantId}`

    const rawres: TenantDetailResult = await api(event, method, path, {})
    const res = {
        ...rawres,
        data: tenantToTenantForm(rawres.data),
    }
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
