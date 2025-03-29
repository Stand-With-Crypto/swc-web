import '@/globals.css'

import { NotFoundLayout } from '@/components/app/notFoundLayout'
import { NotFoundPagesContent } from '@/components/app/notFoundPagesContent'
import { generateCountryCodeLayoutMetadata } from '@/utils/server/metadataUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const dynamic = 'error'

// There's no way to force a country code metadata for this page since can only resolve the country code client side
export const metadata = generateCountryCodeLayoutMetadata(DEFAULT_SUPPORTED_COUNTRY_CODE)

export default function NotFound() {
  return (
    <NotFoundLayout>
      <NotFoundPagesContent />
    </NotFoundLayout>
  )
}
