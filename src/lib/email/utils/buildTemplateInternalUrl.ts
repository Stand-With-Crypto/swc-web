import { INTERNAL_BASE_URL } from '@/lib/email/constants'

export function buildTemplateInternalUrl(path: string, params: Record<string, string> = {}) {
  if (!path.startsWith('/')) {
    throw new Error('`path` must start with /')
  }

  const url = new URL(`${INTERNAL_BASE_URL}${path}`)
  url.searchParams.set('utm_source', 'transactional')
  url.searchParams.set('utm_medium', 'email')
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  return url.toString()
}
