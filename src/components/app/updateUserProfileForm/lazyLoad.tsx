import { lazy } from 'react'

export const LazyUpdateUserProfileForm = lazy(() =>
  import('@/components/app/updateUserProfileForm').then(m => ({
    default: m.UpdateUserProfileFormContainer,
  })),
)
