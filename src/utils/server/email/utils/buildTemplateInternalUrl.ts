// Do NOT abstract this function or import any SWC-specific code into this file.
function getBaseUrl() {
  switch (process.env.NEXT_PUBLIC_ENVIRONMENT) {
    case 'production':
      return 'https://www.standwithcrypto.org'
    case 'preview':
      return `https://${process.env.VERCEL_URL!}`
    default:
      return 'http://localhost:3000'
  }
}

const INTERNAL_BASE_URL = getBaseUrl()

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

export function buildTemplateInternalUrlWithCountry({ countryCode }: { countryCode: string }) {
  return (...args: Parameters<typeof buildTemplateInternalUrl>) =>
    buildTemplateInternalUrl(`/${countryCode}${args[0]}`, args[1])
}
