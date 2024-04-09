'use client'

import { getLocalUser } from '@/utils/web/clientLocalUser'

// for now this function just returns getLocalUser. Adding as a hook now so we can dependency inject it later on if needed
export function useLocalUser() {
  return getLocalUser()
}
