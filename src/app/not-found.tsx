import '@/globals.css'

import { DefaultLocaleLayout } from '@/components/app/defaultLocaleLayout'
import { NotFoundPagesContent } from '@/components/app/notFoundPagesContent'

export const dynamic = 'error'

export default function NotFound() {
  return (
    <DefaultLocaleLayout>
      <NotFoundPagesContent />
    </DefaultLocaleLayout>
  )
}
