'use client'
import { useEffect, useMemo, useState } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { actionConfirmUserMergeAlert } from '@/actions/actionConfirmUserMergeAlert'
import { PageUserProfileUser } from '@/components/app/pageUserProfile/getAuthenticatedData'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormItemSkeleton } from '@/components/ui/form'
import { ExternalLink } from '@/components/ui/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import { getUserDisplayNameWithoutENS } from '@/utils/web/userUtils'

export function MergeAlertCTA({
  mergeAlert,
  user,
}: {
  user: PageUserProfileUser
  mergeAlert: PageUserProfileUser['mergeAlerts'][0]
}) {
  const router = useRouter()
  useEffect(() => {
    // Because this should be a rare occurrence, we want to track what % of user profile views have this
    trackClientAnalytic('Merge Account CTA Displayed', { 'User Merge Alert ID': mergeAlert.id })
  }, [mergeAlert.id])
  const initialUserToDeleteId = useMemo(() => {
    if (mergeAlert.hasBeenConfirmedByOtherUser) {
      return mergeAlert.otherUser.id
    }
    return mergeAlert.userAId
  }, [mergeAlert.hasBeenConfirmedByOtherUser, mergeAlert.otherUser.id, mergeAlert.userAId])
  const [userToDeleteId, setUserToDeleteId] = useState<string>(initialUserToDeleteId)
  const [state, setState] = useState<'loading' | null>(null)
  const handleApproval = async () => {
    setState('loading')
    try {
      const result = await actionConfirmUserMergeAlert({
        userMergeAlertId: mergeAlert.id,
        userToDeleteId,
      })
      if (result?.status === 'complete') {
        toast.success('Your accounts have been successfully merged!')
        router.refresh()
      } else {
        setState(null)
        router.refresh()
      }
    } catch (e) {
      Sentry.captureException(e)
      catchUnexpectedServerErrorAndTriggerToast(e)
      setState(null)
    }
  }
  return (
    <Alert className="mx-auto max-w-4xl">
      <AlertCircle />
      <AlertTitle>Merge your accounts</AlertTitle>
      <AlertDescription className="mb-4">
        It looks like this account and {getUserDisplayNameWithoutENS(mergeAlert.otherUser)} might
        both belong to you. Would you like to merge them?
      </AlertDescription>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <FormItemSkeleton>
          <label className="text-sm">Account to delete</label>
          <Select onValueChange={setUserToDeleteId} value={userToDeleteId}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={user.id}>This Account</SelectItem>
              <SelectItem value={mergeAlert.otherUser.id}>Other Account</SelectItem>
            </SelectContent>
          </Select>
        </FormItemSkeleton>
        {(() => {
          if (userToDeleteId === user.id) {
            if (!mergeAlert.hasBeenConfirmedByCurrentUser) {
              return (
                <Button disabled={state === 'loading'} onClick={handleApproval}>
                  Approve merging this account into other account
                </Button>
              )
            }
            return (
              <div>
                <span className="font-bold">Next Steps: </span>Login to your other account to
                finalize this merge.
              </div>
            )
          }
          if (mergeAlert.hasBeenConfirmedByOtherUser) {
            return (
              <Button disabled={state === 'loading'} onClick={handleApproval}>
                Finalize merge to this account
              </Button>
            )
          }
          return (
            <div>
              <span className="font-bold">Next Steps: </span>Login to your other account to approve
              this merge.
            </div>
          )
        })()}
      </div>
      <div className="mt-3 text-sm text-fontcolor-muted">
        Questions? Send an email to{' '}
        <ExternalLink href={'mailto:info@standwithcrypto.org'}>
          info@standwithcrypto.org
        </ExternalLink>
      </div>
    </Alert>
  )
}
