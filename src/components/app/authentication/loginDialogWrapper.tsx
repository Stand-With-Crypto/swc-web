'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { useENS } from '@thirdweb-dev/react'
import { useRouter } from 'next/navigation'
import { Arguments, useSWRConfig } from 'swr'

import { ANALYTICS_NAME_LOGIN } from '@/components/app/authentication/constants'
import { LazyUpdateUserProfileForm } from '@/components/app/updateUserProfileForm/lazyLoad'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { useSections } from '@/hooks/useSections'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { apiUrls } from '@/utils/shared/urls'
import { appendENSHookDataToUser } from '@/utils/web/appendENSHookDataToUser'

import { ThirdwebLoginContent } from './thirdwebLoginContent'

interface LoginDialogWrapperProps extends React.PropsWithChildren {
  authenticatedContent?: React.ReactNode
  loadingFallback?: React.ReactNode
  forceUnauthenticated?: boolean
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
}: LoginDialogWrapperProps) {
  const { session } = useThirdwebData()
  const { goToSection, currentSection } = useSections({
    sections: Object.values(LoginSections),
    initialSectionId: LoginSections.LOADING,
    analyticsName: 'Login Button',
  })
  const dialogProps = useDialog({ analytics: ANALYTICS_NAME_LOGIN })

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

    if (!session.isLoggedIn && currentSection === LoginSections.AUTHENTICATED) {
      goToSection(LoginSections.LOGIN, { disableAnalytics: true })
    }

    if (!dialogProps.open || currentSection === LoginSections.LOADING) {
      goToSection(session.isLoggedIn ? LoginSections.AUTHENTICATED : LoginSections.LOGIN, {
        disableAnalytics: true,
      })
    }
  }, [currentSection, dialogProps.open, goToSection, session])

  const shouldShowLoadingState = session.isLoading || currentSection === LoginSections.LOADING
  if (shouldShowLoadingState && loadingFallback) {
    return loadingFallback
  }

  if (
    session.isLoggedIn &&
    currentSection === LoginSections.AUTHENTICATED &&
    !forceUnauthenticated
  ) {
    return authenticatedContent
  }

  return (
    <UnauthenticatedSection
      currentSection={currentSection}
      dialogProps={dialogProps}
      goToSection={goToSection}
    >
      {children}
    </UnauthenticatedSection>
  )
}

export function UnauthenticatedSection({
  children,
  goToSection,
  currentSection,
  dialogProps,
}: React.PropsWithChildren<{
  goToSection: (section: LoginSections) => void
  currentSection: LoginSections
  dialogProps: ReturnType<typeof useDialog>
}>) {
  const { session } = useThirdwebData()

  const { mutate } = useApiResponseForUserFullProfileInfo()

  const setDialogOpen = React.useCallback(
    (open: boolean) => {
      dialogProps.onOpenChange(open)

      if (!open && session.isLoggedIn) {
        goToSection(LoginSections.AUTHENTICATED)
      }
    },
    [dialogProps, goToSection, session.isLoggedIn],
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
      <DialogContent className="max-w-l w-full">
        {currentSection === LoginSections.LOGIN ? (
          <LoginSection onLogin={handleLoginSuccess} />
        ) : (
          <FinishProfileSection
            onSuccess={() => {
              setDialogOpen(false)
              mutate()
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function LoginSection({ onLogin }: { onLogin: () => void | Promise<void> }) {
  const router = useRouter()
  const { mutate } = useSWRConfig()

  return (
    <ThirdwebLoginContent
      auth={{
        onLogin: async () => {
          await onLogin()

          // ensure that any server components on the page that's being used are refreshed with the context the user is now logged in
          router.refresh()

          // These are keys which the mutation occurs on login
          // If we reset the cache we can have a situation where the value goes from `value => undefined => value`
          const excludedKeysFromCacheReset: Arguments[] = [apiUrls.userFullProfileInfo()]

          // There are a bunch of SWR queries that might show stale unauthenticated data unless we clear the cache.
          // This ensures we refetch using the users authenticated state
          // https://swr.vercel.app/docs/advanced/cache#modify-the-cache-data
          mutate(arg => !excludedKeysFromCacheReset.includes(arg), undefined, {
            revalidate: true,
          })
        },
      }}
    />
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
      <LazyUpdateUserProfileForm onSuccess={onSuccess} user={user} />
    </React.Suspense>
  )
}
