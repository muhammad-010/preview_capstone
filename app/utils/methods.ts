/* eslint-disable @typescript-eslint/no-explicit-any */
export function percentToPx(n: number, size: number) {
    return (n / 100) * size
}

export function pxToPercent(n: number, size: number) {
    return (n / size) * 100
}

export function cloneObject(target: any) {
    return structuredClone(toRaw(target))
}

export function sessionFromTicketAbility(data: TenantEventTicketAbility): TenantEventSession | undefined {
  if (data.reference_type !== 'event_session') return undefined
  if (data.reference.event_session_id === undefined) return undefined

  return {
    event_session_id: data.reference.event_session_id,
    name: data.reference.name,
    start_time: data.reference.start_time,
    end_time: data.reference.end_time,
    location: data.reference.location,
  } as TenantEventSession
}

export async function downloadFileUrl(url: string) {
  if (!import.meta.client) return

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to download')
  }

  const blob = await response.blob()

  const blobUrl = URL.createObjectURL(blob)

  const filename = decodeURIComponent(
    new URL(url).pathname.split('/').pop() || 'download'
  )

  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  a.click()

  URL.revokeObjectURL(blobUrl)
}
