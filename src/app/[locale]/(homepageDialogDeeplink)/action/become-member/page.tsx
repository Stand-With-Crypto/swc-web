'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import { HasOptedInToMembershipForm } from '@/components/app/userActionFormSuccessScreen/hasOptedInToMembershipForm'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'

import { SuccessState } from './sucessState'

export default function UserActionBecomeMemberDeepLink() {
  const router = useRouter()
  const [isSuccess, setIsSuccess] = React.useState(false)

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
