export default defineEventHandler(async (event): Promise<FetchResult> => {
    const method = 'PUT'
    const id = getRouterParam(event, 'id')
    const path = `/tenant/${id}`
    const rawbody = await readBody(event)
    const body = formatTenantForm(rawbody)

    const res: FetchResult = await externalApi(event, method, path, {
        body,
    })
    if (res.success) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
