const INVITATION_PATH_PATTERN = /^\/invite\/([^/]+)$/

export function getInvitationPath(token: string) {
  return `/invite/${encodeURIComponent(token)}`
}

export function parseInvitationToken(value: string) {
  const normalizedValue = value.trim()

  if (!normalizedValue)
    return ''

  if (!normalizedValue.includes('/'))
    return normalizedValue

  try {
    const url = new URL(normalizedValue, typeof window === 'undefined' ? 'http://localhost' : window.location.origin)
    const invitationToken = url.pathname.match(INVITATION_PATH_PATTERN)?.[1]

    return invitationToken ? decodeURIComponent(invitationToken) : normalizedValue
  }
  catch {
    return normalizedValue
  }
}

export function getInvitationUrl(token: string) {
  const invitationPath = getInvitationPath(token)

  if (typeof window === 'undefined')
    return invitationPath

  return new URL(invitationPath, window.location.origin).toString()
}
