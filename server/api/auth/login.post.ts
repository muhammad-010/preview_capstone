export default defineEventHandler(async (event): Promise<FetchResult> => {
    const body = await readBody(event)

    const res: LoginResult = await externalApi(event, 'POST', '/auth/login', {
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
        console.error('Login failed:', res)
        return { message: 'Login failed' }
    }
})
