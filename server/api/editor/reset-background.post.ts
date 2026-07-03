import { $fetch } from 'ofetch'

/**
 * Reset-to-default helper. The backend only changes a variant's background via an
 * `upload_key` (it ignores `background_image_url` on save), so to restore the
 * factory default image we fetch that static image server-side (no CORS) and
 * re-upload it through the backend's media endpoint, returning a fresh upload key
 * the editor then saves like any normal background upload.
 */
export default defineEventHandler(async (event): Promise<UploadMediaResult> => {
    const externalApi = process.env.EXTERNAL_API_URL
    if (!externalApi) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'No External API defined',
        })
    }

    const body = await readBody<{ path?: string }>(event)
    const path = body?.path
    // only allow the known static default-image paths
    if (!path || !/^\/storage\/file\/static\/image\/default_[\w-]+\.(png|jpe?g)$/i.test(path)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid default background path',
        })
    }

    const buffer = await $fetch<ArrayBuffer>(path, { baseURL: externalApi, responseType: 'arrayBuffer' })
    const filename = path.split('/').pop() || 'default.png'
    const type = /\.png$/i.test(filename) ? 'image/png' : 'image/jpeg'

    const form = new FormData()
    form.append('file', new Blob([new Uint8Array(buffer)], { type }), filename)

    const res: UploadMediaResult = await api(event, 'POST', '/upload/media', { body: form })
    if (!res.success) {
        console.error('reset-background upload failed', res)
    }
    return res
})
