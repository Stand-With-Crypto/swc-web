import { headers } from 'next/headers'

export async function getIPFromHeaders() {
  const currentHeaders = await headers()
  const forwardedFor = currentHeaders.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = currentHeaders.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return null
}
