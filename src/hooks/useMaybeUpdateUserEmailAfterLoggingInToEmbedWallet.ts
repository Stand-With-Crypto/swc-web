/*
Ideally this logic is 100% implemented on the backend in the onLogin callback hook within thirdweb
but they don't appear to have any easy API to access this information outside the client
So far fow we'll use a hook to update the user's email address after they log in, if applicable
*/

import { actionMaybePersistEmbeddedWalletMetadata } from '@/actions/actionMaybePersistEmbeddedWalletMetadata'
import { useEmbeddedWalletUserEmail } from '@thirdweb-dev/react'
import { useEffect } from 'react'

export function useMaybeUpdateUserEmailAfterLoggingInToEmbedWallet() {
  const res = useEmbeddedWalletUserEmail()
  const email = res.data
  useEffect(() => {
    if (email) {
      actionMaybePersistEmbeddedWalletMetadata({ email })
    }
  }, [email])
}
