export default defineEventHandler(async (event) => {
    const method = 'GET'
    const filepath = getRouterParam(event, 'filepath')
    const path = `/files/template/${filepath}`

    const res = await api(event, method, path, {})
    if (res) {
        return res
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
