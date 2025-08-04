import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/web/cn'

import {
  getDefaultFilters,
  PARTY_OPTIONS_DISPLAY_NAME,
  ROLE_OPTIONS_DISPLAY_NAME,
  STANCE_OPTIONS_DISPLAY_NAME,
} from './constants'
import type { FILTER_KEYS, PARTY_OPTION, ROLE_OPTION, STANCE_OPTION } from './types'
import { PARTY_OPTIONS, ROLE_OPTIONS, STANCE_OPTIONS, STANDARD_OPTION } from './types'

interface FiltersProps {
  filtersValue: FILTER_KEYS
  onChange: React.Dispatch<React.SetStateAction<FILTER_KEYS>>
  className?: string
}

export function Filters(props: FiltersProps) {
  const { filtersValue, onChange, className } = props

  const handleChange = useCallback(
    (value: Partial<FILTER_KEYS>) => {
      onChange(prev => ({
        ...prev,
        ...value,
      }))
    },
    [onChange],
  )

  return (
    <div
      className={cn(
        'flex w-full flex-1 justify-between gap-2 overflow-x-auto bg-muted p-4',
        className,
      )}
    >
      <div className="flex flex-1 gap-2">
        <Select
          onValueChange={(stance: STANCE_OPTION) => handleChange({ stance })}
          value={filtersValue.stance}
        >
          <SelectTrigger data-testid="stance-filter-trigger">
            <span className="mr-2 inline-block flex-shrink-0 font-bold">Stance</span>
            <span className="mr-auto">
              <SelectValue placeholder={STANDARD_OPTION} />
            </span>
          </SelectTrigger>
          <SelectContent
            ref={ref => {
              if (!ref) return
              ref.ontouchend = e => {
                e.preventDefault()
              }
            }}
          >
            {STANCE_OPTIONS.map(stance => (
              <SelectItem key={stance} onClick={event => event.stopPropagation()} value={stance}>
                {STANCE_OPTIONS_DISPLAY_NAME[stance]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(role: ROLE_OPTION) => handleChange({ role })}
          value={filtersValue.role}
        >
          <SelectTrigger data-testid="role-filter-trigger">
            <span className="mr-2 inline-block flex-shrink-0 font-bold">Role</span>
            <span className="mr-auto">
              <SelectValue placeholder={STANDARD_OPTION} />
            </span>
          </SelectTrigger>
          <SelectContent
            ref={ref => {
              if (!ref) return
              ref.ontouchend = e => {
                e.preventDefault()
              }
            }}
          >
            {ROLE_OPTIONS.map(role => (
              <SelectItem key={role} onClick={event => event.stopPropagation()} value={role}>
                {ROLE_OPTIONS_DISPLAY_NAME[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(party: PARTY_OPTION) => handleChange({ party })}
          value={filtersValue.party}
        >
          <SelectTrigger data-testid="party-filter-trigger">
            <span className="mr-2 inline-block flex-shrink-0 font-bold">Party</span>
            <span className="mr-auto">
              <SelectValue placeholder={STANDARD_OPTION} />
            </span>
          </SelectTrigger>
          <SelectContent
            ref={ref => {
              if (!ref) return
              ref.ontouchend = e => {
                e.preventDefault()
              }
            }}
          >
            {PARTY_OPTIONS.map(party => (
              <SelectItem key={party} onClick={event => event.stopPropagation()} value={party}>
                {PARTY_OPTIONS_DISPLAY_NAME[party]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={() => onChange(getDefaultFilters())} variant="secondary">
        Reset
      </Button>
    </div>
  )
}

// Re-export the types and constants for backward compatibility
export type { FILTER_KEYS } from './types'
export { getDefaultFilters } from './constants'
export { STANDARD_OPTION } from './types'
