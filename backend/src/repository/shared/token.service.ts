export class TokenService {
  generate(bytes = 32): string {
    return crypto.getRandomValues(new Uint8Array(bytes)).toHex()
  }
}

export const tokenService = new TokenService()
