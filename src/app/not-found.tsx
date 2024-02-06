import '@/globals.css'

import { NotFoundPagesContent } from '@/components/app/notFoundPagesContent'
import { DefaultLocaleLayout } from '@/components/app/defaultLocaleLayout'

export const dynamic = 'error'

export default function NotFound() {
  return (
    <DefaultLocaleLayout>
      <NotFoundPagesContent />
    </DefaultLocaleLayout>
  )
}
