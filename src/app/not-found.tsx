import { NotFoundPagesContent } from '@/components/app/notFoundPagesContent'
import { cn } from '@/utils/web/cn'
import { Inter } from 'next/font/google'

// TODO replace with font we want
const inter = Inter({ subsets: ['latin'] })
export const dynamic = 'error'

export default function NotFound() {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'flex h-screen content-center items-center')}>
        <main className="prose-sm mx-auto mt-10 w-full max-w-xl p-4">
          <NotFoundPagesContent skipTracking />
        </main>
      </body>
    </html>
  )
}
