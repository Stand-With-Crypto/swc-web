'use client'

import React, { Suspense,useState  } from 'react'
import { useRouter } from 'next/navigation'

import { UserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/skeleton'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useLocale } from '@/hooks/useLocale'
import { useParseRnQueryParam } from '@/hooks/useRnQueryParams'
import { getIntlUrls } from '@/utils/shared/urls'

function UserActionFormEmailCongresspersonDeeplinkWrapperContent() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const locale = useLocale()
  const urls = getIntlUrls(locale)
  const [state, setState] = useState<'form' | 'success'>('form')
  const { user } = fetchUser.data || { user: null }
  const { address, email, fullName, loading: loadingRnQueryParam } = useParseRnQueryParam()

  const rnParams = React.useMemo(() => ({ address, email, fullName }), [address, email, fullName])

  return fetchUser.isLoading || loadingRnQueryParam ? (
    <UserActionFormEmailCongresspersonSkeleton locale={locale} />
  ) : state === 'form' ? (
    <UserActionFormEmailCongressperson
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
      rnParams={rnParams}
      user={user}
    />
  ) : (
    <UserActionFormSuccessScreen onClose={() => router.replace(urls.home())} />
  )
}

export function UserActionFormEmailCongresspersonDeeplinkWrapper() {
  const locale = useLocale()
  return (
    <Suspense fallback={<UserActionFormEmailCongresspersonSkeleton locale={locale} />}>
      <UserActionFormEmailCongresspersonDeeplinkWrapperContent />
    </Suspense>
  )
}
