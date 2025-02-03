import '@/globals.css'

import { DefaultCountryCodeLayout } from '@/components/app/defaultCountryCodeLayout'
import { NotFoundPagesContent } from '@/components/app/notFoundPagesContent'

export const dynamic = 'error'

export default function NotFound() {
  return (
    <DefaultCountryCodeLayout>
      <NotFoundPagesContent />
    </DefaultCountryCodeLayout>
  )
}
