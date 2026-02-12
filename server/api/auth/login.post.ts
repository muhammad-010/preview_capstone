export default defineEventHandler(async (event): Promise<FetchResult> => {
    const method = 'POST'
    const path = '/auth/login'
    const body = await readBody(event)

    const res: LoginResult = await externalApi(event, method, path, {
        body,
    })
    if (res.success) {
        await setUserSession(event, {
            user: res.data.user,
            secure: {
                access_token: res.data.access_token,
            },
        })
        return {
            message: 'Login successful',
            redirect: defaultRedirect(res.data.user.role_slug),
        }
    }
    else {
        console.error(`${method} ${path} failed`, res)
        return res
    }
})
