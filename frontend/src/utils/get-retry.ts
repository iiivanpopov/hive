export function getRetry(retry: boolean | number) {
  if (typeof retry === 'number')
    return retry
  return retry ? 1 : 0
}
