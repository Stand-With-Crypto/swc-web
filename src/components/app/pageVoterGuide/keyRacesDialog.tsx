'use client'

import { ReactNode, useState } from 'react'
import dynamic from 'next/dynamic'

import { ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED } from '@/components/app/pageVoterGuide/constants'
import { getDefaultValues } from '@/components/app/pageVoterGuide/formConfig'
import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useDialog } from '@/hooks/useDialog'
import { useSession } from '@/hooks/useSession'

import { SaveProgressToast } from './saveProgressToast'

const GetInformedForm = dynamic(
  () => import('@/components/app/pageVoterGuide/getInformedForm').then(mod => mod.GetInformedForm),
  {
    loading: () => (
      <div className="min-h-[400px]">
        <LoadingOverlay />
      </div>
    ),
  },
)

interface KeyRacesDialogProps {
  children: ReactNode
  defaultOpen?: boolean
}

export const KeyRacesDialog = (props: KeyRacesDialogProps) => {
  const { children, defaultOpen } = props

  const session = useSession()
  const user = session?.user

  const [toastOpen, setToastOpen] = useState(false)

  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED,
  })

  return (
    <>
      <UserActionFormDialog {...dialogProps} padding={false} trigger={children}>
        {session?.isLoading ? (
          <div className="min-h-[400px]">
            <LoadingOverlay />
          </div>
        ) : (
          <GetInformedForm
            initialValues={getDefaultValues({ user })}
            onFinish={() => {
              dialogProps.onOpenChange(false)
            }}
            onUserActionCreated={() => {
              if (!session.isLoggedIn) {
                setToastOpen(true)
              }
            }}
          />
        )}
      </UserActionFormDialog>

      <SaveProgressToast isOpen={toastOpen} onClose={() => setToastOpen(false)} />
    </>
  )
}
