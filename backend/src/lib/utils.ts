export function normalizeUserAgent(userAgent?: string | null) {
  return userAgent?.trim().toLowerCase() || 'unknown'
}

export function hmac256Hex(input: string) {
  const h = new Bun.CryptoHasher('sha256', Bun.env.HASH_SEED)
  h.update(input)
  return h.digest('hex')
}
