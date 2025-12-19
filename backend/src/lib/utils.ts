export function generateToken(length = 32) {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(length))).toString('hex')
}
