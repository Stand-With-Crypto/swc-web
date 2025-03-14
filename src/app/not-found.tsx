import '@/globals.css'

import { NotFoundLayout } from '@/components/app/notFoundLayout'
import { NotFoundPagesContent } from '@/components/app/notFoundPagesContent'

export default function NotFound() {
  return (
    <NotFoundLayout>
      <NotFoundPagesContent />
    </NotFoundLayout>
  )
}
