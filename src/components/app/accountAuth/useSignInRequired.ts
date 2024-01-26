import { useConnectionStatus, useThirdwebAuthContext, useUser } from '@thirdweb-dev/react'

export function useSignInRequired(loginOptional?: boolean) {
  const connectionStatus = useConnectionStatus()
  const { user } = useUser()
  const authConfig = useThirdwebAuthContext()

  if (loginOptional === true) {
    return false
  }

  return !!authConfig?.authUrl && !user?.address && connectionStatus === 'connected'
}
