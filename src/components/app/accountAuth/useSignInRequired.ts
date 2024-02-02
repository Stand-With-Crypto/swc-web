import { ACCOUNT_AUTH_CONFIG } from '@/components/app/accountAuth/constants'
import { useConnectionStatus, useThirdwebAuthContext, useUser } from '@thirdweb-dev/react'

/**
 * We need to know, based on the thirdweb configuration and other rules,
 * if we should show the sign in modal or not,
 * these are the scenarios where we should not require the sign in page:
 * - When the user is already connected
 * - When there is no configuration for thirdweb's auth
 * - When the wallet is connected but the user is not signed in
 */
export function useSignInRequired() {
  const connectionStatus = useConnectionStatus()
  const { user } = useUser()
  const authConfig = useThirdwebAuthContext()

  if (ACCOUNT_AUTH_CONFIG.loginOptional) {
    return false
  }

  return !!authConfig?.authUrl && !user?.address && connectionStatus === 'connected'
}
