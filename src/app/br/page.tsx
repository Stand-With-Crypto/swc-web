import { notFound } from 'next/navigation'

import { StaticPageProps } from '@/types'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'
export const dynamicParams = false

export default async function Home(_: StaticPageProps) {
  const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
  if (isProd) {
    notFound()
  }

  return (
    <div>
      <h1>UK homepage</h1>
    </div>
  )
}
