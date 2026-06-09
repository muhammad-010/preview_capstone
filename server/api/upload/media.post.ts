export default defineEventHandler(async (event): Promise<UploadMediaResult> => {
    const method = 'POST'
    const path = `/upload/media`
    const rawbody = await readMultipartFormData(event)
    const file = rawbody?.[0]
    if (!file) {
        throw createError({
            statusCode: 400,
            message: 'No file provided',
        })
    }
    const body = new FormData()
    body.append('file', new Blob([new Uint8Array(file.data)]), file.filename)

    const res: UploadMediaResult = await api(event, method, path, {
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

