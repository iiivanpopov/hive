export const authConfig = {
  sessionTokenCookie: 'session_token',
  sessionTokenTtl: 7 * 24 * 60 * 60, // 7 days in seconds
  confirmationTokenTtl: 10 * 60 * 60, // 10 hours in seconds
  resetPasswordTokenTtl: 10 * 60, // 10 minutes in seconds
}
