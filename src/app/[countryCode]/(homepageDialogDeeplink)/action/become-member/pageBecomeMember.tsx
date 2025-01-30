'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { HasOptedInToMembershipForm } from '@/components/app/userActionFormSuccessScreen/hasOptedInToMembershipForm'
import { Button } from '@/components/ui/button'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { cn } from '@/utils/web/cn'

type Props = {
  hasOptedInToMembership?: boolean
}

export function PageBecomeMember({ hasOptedInToMembership = false }: Props) {
  const router = useRouter()
  const [isSuccess, setIsSuccess] = React.useState(hasOptedInToMembership)

  if (isSuccess) return <SuccessState />

  return (
    <div className={dialogContentPaddingStyles}>
      <HasOptedInToMembershipForm
        onCancel={() => router.replace('/')}
        onSuccess={() => setIsSuccess(true)}
      />
    </div>
  )
}

function SuccessState() {
  const router = useRouter()
  const urls = useIntlUrls()

  return (
    <div className={cn('w-full space-y-6 text-center', dialogContentPaddingStyles)}>
      <div>
        <div className="inline-block rounded-full bg-green-600 p-1 text-white">
          <Check className="h-6 w-6" />
        </div>
      </div>
      <PageTitle size="sm">Thanks for becoming a 501(c)4 member of Stand With Crypto.</PageTitle>
      <PageSubTitle withoutBalancer>
        You made history by joining the largest pro-crypto organization in the U.S. Don’t stop here
        - continue the fight for crypto.
      </PageSubTitle>
      <Button className="text-center" onClick={() => router.replace(urls.profile())} size="lg">
        View Profile
      </Button>
    </div>
  )
}
