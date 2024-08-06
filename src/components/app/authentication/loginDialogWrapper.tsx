'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import useSWR, { Arguments, useSWRConfig } from 'swr'

import { ClientUnidentifiedUser } from '@/clientModels/clientUser/clientUser'
import {
  ANALYTICS_NAME_LOGIN,
  ANALYTICS_NAME_USER_ACTION_SUCCESS_JOIN_SWC,
} from '@/components/app/authentication/constants'
import { GeoGate } from '@/components/app/geoGate'
import { UserProfileFormSections } from '@/components/app/updateUserProfileForm'
import { LazyUpdateUserProfileForm } from '@/components/app/updateUserProfileForm/lazyLoad'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { Dialog, DialogBody, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { useENS } from '@/hooks/useENS'
import { useSections } from '@/hooks/useSections'
import { useSession } from '@/hooks/useSession'
import { fetchReq } from '@/utils/shared/fetchReq'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import { appendENSHookDataToUser } from '@/utils/web/appendENSHookDataToUser'
import { getUserSessionIdOnClient } from '@/utils/web/clientUserSessionId'

import { ThirdwebLoginContent, ThirdwebLoginContentProps } from './thirdwebLoginContent'

const UserActionFormJoinSWCSuccessDialog = dynamic(
  () =>
    import('@/components/app/userActionFormJoinSWC/successDialog').then(
      module => module.UserActionFormJoinSWCSuccessDialog,
    ),
  {
    loading: () => <LoadingOverlay />,
  },
)

interface LoginDialogWrapperProps extends React.PropsWithChildren<ThirdwebLoginContentProps> {
  authenticatedContent?: React.ReactNode
  loadingFallback?: React.ReactNode
  /**
   * If this is true the component will show the unauthenticated content
   * regardless if the user is authenticated or not
   */
  forceUnauthenticated?: boolean
  /**
   * If this is true than the component will use thirdweb's session
   * instead of our internal authentication
   */
  useThirdwebSession?: boolean
}

enum LoginSections {
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  LOGIN = 'login',
  FINISH_PROFILE = 'finishProfile',
}

export function LoginDialogWrapper({
  children,
  authenticatedContent,
  loadingFallback,
  forceUnauthenticated,
  useThirdwebSession = false,
  ...props
}: LoginDialogWrapperProps) {
  const session = useSession()
  const { goToSection, currentSection } = useSections({
    sections: Object.values(LoginSections),
    initialSectionId: LoginSections.LOADING,
    analyticsName: 'Login Button',
  })
  const dialogProps = useDialog({ analytics: ANALYTICS_NAME_LOGIN })
  const successDialogProps = useDialog({
    analytics: ANALYTICS_NAME_USER_ACTION_SUCCESS_JOIN_SWC,
  })

  const isLoggedIn = React.useMemo(
    () => (useThirdwebSession ? session.isLoggedInThirdweb : session.isLoggedIn),
    [session.isLoggedIn, session.isLoggedInThirdweb, useThirdwebSession],
  )

  /**
   * This is not pretty, but we need to both sync the session state with the current section
   * and also be able to programmatically change the section. The edge cases we're handling here are:
   * 1. When the user logs in we should not send him directly to the authed content, we should let
   *    `handleLoginSuccess` decide to sent him to finish profile or to the authed content
   * 2. When the user refreshes the page we should verify, based on the session, if we should show
   *    the authed or unauthed content
   * 3. When the user logs in and out without refreshing the page we should change the current section manually
   * 4. If the user logs out through other instance of this component, we should change the current section manually
   */
  React.useEffect(() => {
    if (session.isLoading) {
      return
    }

    if (!isLoggedIn && currentSection === LoginSections.AUTHENTICATED) {
      goToSection(LoginSections.LOGIN, { disableAnalytics: true })
    }

    if (!dialogProps.open || currentSection === LoginSections.LOADING) {
      goToSection(isLoggedIn ? LoginSections.AUTHENTICATED : LoginSections.LOGIN, {
        disableAnalytics: true,
      })
    }
  }, [currentSection, dialogProps.open, goToSection, isLoggedIn, session])

  const shouldShowLoadingState = session.isLoading || currentSection === LoginSections.LOADING
  if (shouldShowLoadingState && loadingFallback) {
    return loadingFallback
  }

  if (isLoggedIn && currentSection === LoginSections.AUTHENTICATED && !forceUnauthenticated) {
    return (
      <>
        {session.user?.primaryUserCryptoAddress?.wasRecentlyUpdated && successDialogProps.open ? (
          <UserActionFormJoinSWCSuccessDialog {...successDialogProps} />
        ) : null}
        {authenticatedContent}
      </>
    )
  }

  return (
    <UnauthenticatedSection
      currentSection={currentSection}
      dialogProps={dialogProps}
      goToSection={goToSection}
      isLoggedIn={isLoggedIn}
      onLoginSuccess={() => successDialogProps.onOpenChange(true)}
      {...props}
    >
      {children}
    </UnauthenticatedSection>
  )
}

interface UnauthenticatedSectionProps extends React.PropsWithChildren<ThirdwebLoginContentProps> {
  goToSection: (section: LoginSections) => void
  currentSection: LoginSections
  dialogProps: ReturnType<typeof useDialog>
  isLoggedIn: boolean
  /**
   * Callback that is called after the user logs in and closes the dialog.
   */
  onLoginSuccess?: () => void
}

export function UnauthenticatedSection({
  children,
  goToSection,
  currentSection,
  dialogProps,
  isLoggedIn,
  onLoginSuccess,
  ...props
}: UnauthenticatedSectionProps) {
  const { mutate } = useApiResponseForUserFullProfileInfo()

  const setDialogOpen = React.useCallback(
    (open: boolean) => {
      dialogProps.onOpenChange(open)

      if (!open && isLoggedIn) {
        goToSection(LoginSections.AUTHENTICATED)
        onLoginSuccess?.()
      }
    },
    [dialogProps, goToSection, isLoggedIn, onLoginSuccess],
  )

  const handleLoginSuccess = React.useCallback(async () => {
    const { user } = (await mutate()) ?? {}

    if (!user?.primaryUserCryptoAddress) {
      Sentry.captureMessage(
        'Login - `useApiResponseForUserFullProfileInfo` did not return `primaryUserCryptoAddress` for a logged in user.',
        {
          extra: { user },
          tags: { domain: 'LoginDialogWrapper/UnauthenticatedSection/handleLoginSuccess' },
        },
      )
      setDialogOpen(false)
      return
    }

    const { wasRecentlyUpdated } = user.primaryUserCryptoAddress
    if (wasRecentlyUpdated) {
      goToSection(LoginSections.FINISH_PROFILE)
    } else {
      setDialogOpen(false)
    }
  }, [goToSection, mutate, setDialogOpen])

  return (
    <Dialog {...dialogProps} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        a11yTitle={currentSection === LoginSections.LOGIN ? 'Sign in' : 'Finish Profile'}
        className="max-w-l w-full"
      >
        <GeoGate
          bypassCountryCheck // For Onchain Summer
          countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
          unavailableContent={<UserActionFormActionUnavailable />}
        >
          {currentSection === LoginSections.LOGIN ? (
            <DialogBody>
              <LoginSection onLogin={handleLoginSuccess} {...props} />
            </DialogBody>
          ) : (
            <FinishProfileSection
              onSuccess={() => {
                setDialogOpen(false)
                void mutate()
              }}
            />
          )}
        </GeoGate>
      </DialogContent>
    </Dialog>
  )
}

interface LoginSectionProps extends ThirdwebLoginContentProps {
  onLogin: () => void | Promise<void>
}

function LoginSection({ onLogin, ...props }: LoginSectionProps) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { data } = useInitialEmail()

  return (
    <ThirdwebLoginContent
      initialEmailAddress={data?.user?.emailAddress}
      onLoginCallback={async () => {
        await onLogin()
        // ensure that any server components on the page that's being used are refreshed with the context the user is now logged in
        router.refresh()

        // These are keys which the mutation occurs on login
        // If we reset the cache we can have a situation where the value goes from `value => undefined => value`
        const excludedKeysFromCacheReset: Arguments[] = [apiUrls.userFullProfileInfo()]

        // There are a bunch of SWR queries that might show stale unauthenticated data unless we clear the cache.
        // This ensures we refetch using the users authenticated state
        // https://swr.vercel.app/docs/advanced/cache#modify-the-cache-data
        void mutate(arg => !excludedKeysFromCacheReset.includes(arg), undefined, {
          revalidate: true,
        })
      }}
      {...props}
    />
  )
}

function useInitialEmail() {
  const localSessionId = getUserSessionIdOnClient()
  return useSWR(
    localSessionId ? apiUrls.unidentifiedUser({ sessionId: localSessionId }) : null,
    async url => {
      return fetchReq(url)
        .then(res => res.json() as Promise<{ user: ClientUnidentifiedUser | null }>)
        .catch(err => {
          Sentry.captureException(err, {
            tags: { domain: 'useInitialEmail' },
            extra: { url },
          })
          return null
        })
    },
  )
}

function FinishProfileSection({ onSuccess }: { onSuccess: () => void }) {
  const { data: userData } = useApiResponseForUserFullProfileInfo()
  const { data: ensData, isLoading: isLoadingEnsData } = useENS()

  const user = React.useMemo(() => {
    if (!userData?.user || isLoadingEnsData) {
      return null
    }

    return appendENSHookDataToUser(userData.user, ensData)
  }, [ensData, isLoadingEnsData, userData])

  const loadingRender = <Skeleton className="h-80 w-full" />
  if (!user) {
    return loadingRender
  }

  return (
    <React.Suspense fallback={loadingRender}>
      <LazyUpdateUserProfileForm
        onSuccess={onSuccess}
        skipSections={[UserProfileFormSections.InformationVisibility]}
        user={user}
      />
    </React.Suspense>
  )
}
