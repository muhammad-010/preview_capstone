export async function useDownload(
    url: string,
    filename: string,
    options: Parameters<typeof $fetch>[1] = {},
) {
    const response = await $fetch.raw(url, {
        ...options,
        responseType: 'blob',
    })

    const blob = response._data as Blob

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
}
