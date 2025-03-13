import '@/globals.css'

import { DefaultCountryCodeLayout } from '@/components/app/defaultCountryCodeLayout'
import { NotFoundPagesContent } from '@/components/app/notFoundPagesContent'

export default function NotFound() {
  return (
    <DefaultCountryCodeLayout>
      <NotFoundPagesContent />
    </DefaultCountryCodeLayout>
  )
}
