import { headers } from 'next/headers'

export function getIPFromHeaders() {
  const forwardedFor = headers().get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = headers().get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return null
}
