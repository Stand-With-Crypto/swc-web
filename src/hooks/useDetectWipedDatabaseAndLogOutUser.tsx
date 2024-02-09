/*
In testing and local dev, we often wipe our database. If we're currently logged in to the site when we do this,
lots of APIs will start failing in unpredictable ways because we expect every auth session to have a corresponding logged in user.
This hook resets the user to logged out if we detect that the database has been wiped. 
*/

import { useEffect } from 'react'
import { useLogout } from '@thirdweb-dev/react'
import useSWR from 'swr'

import { DetectWipedDatabaseResponse } from '@/app/api/identified-user/detect-wiped-database/route'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { apiUrls } from '@/utils/shared/urls'

const logger = getLogger('useDetectWipedDatabaseAndLogOutUser')

export function useDetectWipedDatabaseAndLogOutUser() {
  const { logout } = useLogout()
  const shouldCheck = NEXT_PUBLIC_ENVIRONMENT !== 'production'
  const wipedDatabaseCheck = useSWR(shouldCheck ? apiUrls.detectWipedDatabase() : null, url =>
    fetchReq(url, { method: 'POST' })
      .then(res => res.json())
      .then(data => data as DetectWipedDatabaseResponse),
  )
  const state = wipedDatabaseCheck.data?.state
  useEffect(() => {
    if (state === 'wiped-database') {
      logger.info('Detected wiped database. Logging out user.')
      logout()
    }
  }, [state, logout])
}
