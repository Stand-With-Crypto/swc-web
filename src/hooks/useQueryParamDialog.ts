import { useQueryParamState } from '@/hooks/useQueryParamState'
import { toBool } from '@/utils/shared/toBool'
import { useCallback } from 'react'

export const useQueryParamDialog = ({
  queryParamKey,
}: {
  queryParamKey: string
}): {
  open: boolean
  onOpenChange?(open: boolean): void
} => {
  const { value, setValue } = useQueryParamState({ queryParamKey, defaultValue: null })
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
  return { open, onOpenChange: setValue ? onOpenChange : undefined }
}
