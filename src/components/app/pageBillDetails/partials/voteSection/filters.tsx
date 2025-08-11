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
  PartyOptionsDisplayName,
  RoleOptionsDisplayName,
  StanceOptionsDisplayName,
} from './constants'
import type { FilterKeys, PartyOption, RoleOption, StanceOption } from './types'
import { PartyOptions, RoleOptions, StanceOptions, StandardOption } from './types'

interface FiltersProps {
  filtersValue: FilterKeys
  onChange: React.Dispatch<React.SetStateAction<FilterKeys>>
  className?: string
}

export function Filters(props: FiltersProps) {
  const { filtersValue, onChange, className } = props

  const handleChange = useCallback(
    (value: Partial<FilterKeys>) => {
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
        'flex w-full flex-1 items-center justify-between gap-2 overflow-x-auto bg-muted p-4',
        className,
      )}
    >
      <div className="flex flex-1 gap-2">
        <Select
          onValueChange={(stance: StanceOption) => handleChange({ stance })}
          value={filtersValue.stance}
        >
          <SelectTrigger
            className="w-44 flex-shrink-0 md:flex-1"
            data-testid="stance-filter-trigger"
          >
            <span className="mr-2 inline-block flex-shrink-0 font-bold">Stance</span>
            <span className="mr-auto">
              <SelectValue placeholder={StandardOption} />
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
            {StanceOptions.map(stance => (
              <SelectItem key={stance} onClick={event => event.stopPropagation()} value={stance}>
                {StanceOptionsDisplayName[stance]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(role: RoleOption) => handleChange({ role })}
          value={filtersValue.role}
        >
          <SelectTrigger className="w-44 flex-shrink-0 md:flex-1" data-testid="role-filter-trigger">
            <span className="mr-2 inline-block flex-shrink-0 font-bold">Role</span>
            <span className="mr-auto">
              <SelectValue placeholder={StandardOption} />
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
            {RoleOptions.map(role => (
              <SelectItem key={role} onClick={event => event.stopPropagation()} value={role}>
                {RoleOptionsDisplayName[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(party: PartyOption) => handleChange({ party })}
          value={filtersValue.party}
        >
          <SelectTrigger
            className="w-44 flex-shrink-0 md:flex-1"
            data-testid="party-filter-trigger"
          >
            <span className="mr-2 inline-block flex-shrink-0 font-bold">Party</span>
            <span className="mr-auto">
              <SelectValue placeholder={StandardOption} />
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
            {PartyOptions.map(party => (
              <SelectItem key={party} onClick={event => event.stopPropagation()} value={party}>
                {PartyOptionsDisplayName[party]}
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
