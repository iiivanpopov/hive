export function generateToken() {
  return crypto.getRandomValues(new Uint8Array(16)).toHex()
}

export function normalizeUserAgent(userAgent?: string | null) {
  return userAgent?.trim().toLowerCase() || 'unknown'
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
