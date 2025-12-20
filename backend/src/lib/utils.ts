export function generateToken() {
  return crypto.getRandomValues(new Uint8Array(16)).toHex()
}
