import { useCallback } from 'react'

import { useSearchParamState } from '@/hooks/useSearchParamState'
import { toBool } from '@/utils/shared/toBool'

export const useQueryParamDialog = ({
  queryParamKey,
}: {
  queryParamKey: string
}): {
  open: boolean
  onOpenChange?(open: boolean): void
} => {
  const [value, setValue] = useSearchParamState(queryParamKey, null)
  const open = toBool(value)
  const onOpenChange = useCallback(() => {
    if (!setValue) {
      throw new Error('not possible state for useQueryParamDialog')
    }
    if (open) {
      setValue(null)
    } else {
      setValue('true')
    }
  }, [setValue, open])

  return { open, onOpenChange }
}
