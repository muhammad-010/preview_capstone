export default defineEventHandler(async (event): Promise<DashboardTenantListResult> => {
    const method = 'GET'
    const path = '/widget/tenant/list'

    const res: DashboardTenantListResult = await api(event, method, path)
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
