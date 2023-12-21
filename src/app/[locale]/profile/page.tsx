import { getAuthenticatedData } from '@/app/[locale]/profile/getAuthenticatedData'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'

export const dynamic = 'force-dynamic'

// TODO metadata

export default async function Profile({ params }: PageProps) {
  const urls = getIntlUrls(params.locale)
  const data = await getAuthenticatedData()

  return (
    <div className="prose-sm mx-auto mt-10 w-full max-w-xl p-4">
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </div>
  )
}
