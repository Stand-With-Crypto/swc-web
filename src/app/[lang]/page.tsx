import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'
import Link from 'next/link'

export const revalidate = 3600
export const dynamic = 'error'

// TODO metadata

export default async function Home(props: PageProps) {
  const urls = getIntlUrls(props.params.lang)
  return (
    <main className="prose-sm mx-auto mt-10 w-full max-w-xl p-4">
      <Link href={urls.sampleArchitecturePatterns()}>View Sample Architecture Patterns</Link>
    </main>
  )
}
