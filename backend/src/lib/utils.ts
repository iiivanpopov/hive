export function generateToken() {
  return crypto.getRandomValues(new Uint8Array(16)).toHex()
}

export function normalizeUserAgent(userAgent?: string | null) {
  return userAgent?.trim().toLowerCase() || 'unknown'
}
