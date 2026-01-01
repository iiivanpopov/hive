export const authConfig = {
  sessionTokenCookie: 'session_token',
  sessionTokenTtl: 7 * 24 * 60 * 60, // 7 days in seconds
  confirmationTokenTtl: 10 * 60 * 60, // 10 hours in seconds
  resetPasswordTokenTtl: 10 * 60, // 10 minutes in seconds
  resetPasswordRateLimitTime: 30 * 60, // 30 minutes in seconds
  confirmationEmailRateLimitTime: 10 * 60, // 10 minutes in seconds
  confirmationEmailRateLimitCount: 3, // max 3 emails in the rate limit time
  resetPasswordRateLimitCount: 3, // max 3 emails in the rate limit time
}
