'use client'
import { Button } from '@/components/ui/button'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { USER_SESSION_ID_COOKIE_NAME, generateUserSessionId } from '@/utils/shared/userSessionId'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { cn } from '@/utils/web/cn'
import { ConnectWallet, lightTheme } from '@thirdweb-dev/react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export interface ThirdwebLoginButtonProps {
  children: string
  variant?: 'secondary'
  size?: 'lg'
  style?: React.CSSProperties
}

export function ThirdwebLoginButton(props: ThirdwebLoginButtonProps) {
  const { children, variant, size, style } = props
  const { session } = useThirdwebData()
  const [hasClicked, setHasClicked] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (session.isLoggedIn && hasClicked) {
      trackClientAnalytic('User clicked before button loaded fully')
      setHasClicked(false)
      ref.current?.querySelector('button')?.click()
    }
  }, [hasClicked, session.isLoggedIn])
  if (session.isLoading) {
    return (
      <Button variant={variant} size={size} onClick={() => setHasClicked(true)} style={style}>
        {hasClicked ? 'Loading' : children}
      </Button>
    )
  }

  return (
    <div ref={ref}>
      <BaseThirdwebLoginButton {...props} />
    </div>
  )
}

export function BaseThirdwebLoginButton({
  children,
  variant,
  size,
  style,
}: ThirdwebLoginButtonProps) {
  const router = useRouter()
  return (
    <ConnectWallet
      theme={lightTheme({
        colors: {
          accentText: '#0f172a',
          accentButtonBg: '#0f172a',
          borderColor: '#e2e8f0',
          separatorLine: '#e2e8f0',
          primaryText: '#020817',
          secondaryText: '#64748b',
          secondaryButtonText: '#0f172a',
          secondaryButtonBg: '#f1f5f9',
          connectedButtonBg: '#f1f5f9',
          connectedButtonBgHover: '#e4e2e4',
          walletSelectorButtonHoverBg: '#0f172a',
          secondaryIconColor: '#706f78',
        },
      })}
      auth={{
        loginOptional: false,
        onLogin: () => {
          // ensure that any server components on the page that's being used are refreshed with the context the user is now logged in
          router.refresh()
        },
        onLogout: () => {
          Cookies.set(USER_SESSION_ID_COOKIE_NAME, generateUserSessionId())
        },
      }}
      className={
        /*
    This is a super hacky way of ensuring our button styles override the default styles of the ConnectWallet.
    I copy pasted the button classes and then added !important to each of them https://tailwindcss.com/docs/configuration#important-modifier.
    We'll need to re-update these styles when we modify the actual button component's styles
    Excited for someone to come up with a more elegant approach.
  */
        cn(
          // copy pasted main button code
          '!inline-flex !items-center !justify-center !whitespace-nowrap !rounded-full !text-sm !font-medium !ring-offset-background !transition-colors focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!pointer-events-none disabled:!opacity-50',
          // copy pasted secondary variant code
          variant === 'secondary'
            ? '!bg-secondary !text-secondary-foreground hover:!bg-secondary/80'
            : '!bg-primary !text-primary-foreground hover:!bg-primary/90',
          // copy pasted default size code
          size === 'lg' ? '!h-11 !px-8 !text-base' : '!h-10 !px-4 !py-2',
        )
      }
      // the library puts a inline min-width: 140px on the button, so this is the only way to take priority over that
      style={style || { minWidth: '96px' }}
      btnTitle={children}
      modalTitle={'Stand With Crypto'}
      switchToActiveChain={true}
      modalSize={'compact'}
      modalTitleIconUrl={'/logo/android-chrome-192x192.png'}
      termsOfServiceUrl={'/terms-of-service'}
      privacyPolicyUrl={'/privacy'}
    />
  )
}
