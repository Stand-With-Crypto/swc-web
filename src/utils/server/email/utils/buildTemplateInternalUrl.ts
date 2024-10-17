import { INTERNAL_BASE_URL } from '@/utils/shared/urls'

export function buildTemplateInternalUrl(path: string, params: Record<string, unknown> = {}) {
  if (!path.startsWith('/')) {
    throw new Error('`path` must start with /')
  }

  const url = new URL(`${INTERNAL_BASE_URL}${path}`)
  url.searchParams.set('utm_source', 'transactional')
  url.searchParams.set('utm_medium', 'email')
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value))
  })
  return url.toString()
}
