import { getAuthenticatedData } from '@/app/[locale]/profile/getAuthenticatedData'
import { InternalLink } from '@/components/ui/link'
import { PageProps } from '@/types'
import { appRouterGetAuthUser } from '@/utils/server/appRouterGetAuthUser'
import { getIntlUrls } from '@/utils/shared/urls'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// TODO metadata

export default async function Profile(props: PageProps) {
  const urls = getIntlUrls(props.params.locale)
  const data = await getAuthenticatedData()

  return (
    <div className="prose-sm mx-auto mt-10 w-full max-w-xl p-4">
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </div>
  )
}
