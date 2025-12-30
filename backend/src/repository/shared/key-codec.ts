export type TokenNamespace = 'session' | 'confirm'

export class TokenKeyCodec {
  serialize(ns: TokenNamespace, token: string): string {
    return `${ns}_token:${token}`
  }
}

export const keyCodec = new TokenKeyCodec()
