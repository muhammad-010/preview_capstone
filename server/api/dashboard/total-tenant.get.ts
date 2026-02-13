export default defineEventHandler(async (event): Promise<DashboardCardTotalTenantResult> => {
    const method = 'GET'
    const path = '/widget/tenant/total'

    const res: DashboardCardTotalTenantResult = await externalApi(event, method, path)
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
