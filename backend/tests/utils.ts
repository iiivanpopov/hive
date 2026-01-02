export function extractTokenFromMail({ html }: { html: string }): string | null {
  const match = html.match(/[?&]token=([^"&]+)/)
  return match ? match[1] : null
}

export function extractSessionTokenCookie(headers: Headers): string {
  return headers.getSetCookie()[0].split(';')[0]
}
