export function normalizeUserAgent(userAgent?: string | null) {
  return userAgent?.trim().toLowerCase() || 'unknown'
}
