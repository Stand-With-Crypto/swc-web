'use client'

import { useCallback } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DTSI_BillPersonRelationshipType,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { cn } from '@/utils/web/cn'

const STANCE_OPTIONS = ['All', ...Object.values(DTSI_BillPersonRelationshipType)] as const
type STANCE_OPTION = (typeof STANCE_OPTIONS)[number]
const STANCE_OPTIONS_DISPLAY_NAME: Record<STANCE_OPTION, string> = {
  All: 'All',
  [DTSI_BillPersonRelationshipType.SPONSOR]: 'Sponsor',
  [DTSI_BillPersonRelationshipType.COSPONSOR]: 'Co-sponsor',
  [DTSI_BillPersonRelationshipType.VOTED_FOR]: 'Voted for',
  [DTSI_BillPersonRelationshipType.VOTED_AGAINST]: 'Voted against',
}

const ROLE_OPTIONS = [
  'All',
  DTSI_PersonRoleCategory.SENATE,
  DTSI_PersonRoleCategory.CONGRESS,
] as const
type ROLE_OPTION = (typeof ROLE_OPTIONS)[number]
const ROLE_OPTIONS_DISPLAY_NAME: Record<ROLE_OPTION, string> = {
  All: 'All',
  [DTSI_PersonRoleCategory.SENATE]: 'Senator',
  [DTSI_PersonRoleCategory.CONGRESS]: 'Congressperson',
}

const PARTY_OPTIONS = [
  'All',
  DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
  DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
] as const
type PARTY_OPTION = (typeof PARTY_OPTIONS)[number]
const PARTY_OPTIONS_DISPLAY_NAME: Record<PARTY_OPTION, string> = {
  All: 'All',
  [DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN]: 'Republican',
  [DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT]: 'Democratic',
}

export interface FILTER_KEYS {
  stance: STANCE_OPTION
  role: ROLE_OPTION
  party: PARTY_OPTION
}

export const getDefaultFilters = (): FILTER_KEYS => ({
  stance: 'All',
  role: 'All',
  party: 'All',
})

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
    <div className={cn('grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2', className)}>
      <Select
        onValueChange={(stance: STANCE_OPTION) => handleChange({ stance })}
        value={filtersValue.stance}
      >
        <SelectTrigger data-testid="stance-filter-trigger">
          <span className="mr-2 inline-block flex-shrink-0 font-bold">Stance</span>
          <span className="mr-auto">
            <SelectValue placeholder="All" />
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
            <SelectValue placeholder="All" />
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
            <SelectValue placeholder="All" />
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
  )
}
