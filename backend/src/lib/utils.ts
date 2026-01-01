export function normalizeUserAgent(userAgent?: string | null) {
  return userAgent?.trim().toLowerCase() || 'unknown'
}

export function generateJoinId() {
  return crypto.getRandomValues(new Uint8Array(8)).toHex()
}
