'use client'

import { createColumnHelper, FilterFn } from '@tanstack/react-table'
import { isNil } from 'lodash-es'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { SortableHeader } from '@/components/app/dtsiClientPersonDataTable/dataTable'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { SupportedLocale } from '@/intl/locales'
import { getDTSIPersonRoleCategoryDisplayName } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryDisplayName,
} from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIPersonStanceScoreToCryptoSupportLanguage } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

export type Person = Awaited<ReturnType<typeof queryDTSIAllPeople>>['people'][0]

/**
 * Unique identifiers for eachPersonDataTable Column.
 * Also used to bind a Column to a filter function.
 */
export enum PERSON_TABLE_COLUMNS_IDS {
  FULL_NAME = 'fullName',
  STANCE = 'swcStanceScore',
  ROLE = 'primaryRole',
  PARTY = 'politicalAffiliationCategory',
  STATE = 'state',
}

/**
 * `FilterFns` has to be augmented with the custom filter functions.
 *
 * @see https://tanstack.com/table/v8/docs/api/features/column-filtering#filterfns
 */
declare module '@tanstack/react-table' {
  interface FilterFns {
    [PERSON_TABLE_COLUMNS_IDS.FULL_NAME]: FilterFn<Person>
    [PERSON_TABLE_COLUMNS_IDS.STANCE]: FilterFn<Person>
    [PERSON_TABLE_COLUMNS_IDS.ROLE]: FilterFn<Person>
    [PERSON_TABLE_COLUMNS_IDS.PARTY]: FilterFn<Person>
    [PERSON_TABLE_COLUMNS_IDS.STATE]: FilterFn<Person>
  }
}

const personColumnHelper = createColumnHelper<Person>()

/**
 * Columns definition for PersonDataTable.
 *
 * @see https://tanstack.com/table/latest/docs/guide/column-defs#column-helpers
 */
export const getDTSIClientPersonDataTableColumns = ({ locale }: { locale: SupportedLocale }) => [
  personColumnHelper.accessor(dtsiPersonFullName, {
    id: PERSON_TABLE_COLUMNS_IDS.FULL_NAME,
    filterFn: PERSON_TABLE_COLUMNS_IDS.FULL_NAME,
    cell: ({ row }) => (
      <LinkBox className="flex items-center gap-3">
        <DTSIAvatar person={row.original} size={40} />
        <InternalLink
          className={cn(linkBoxLinkClassName, 'cursor-pointer')}
          href={getIntlUrls(locale).politicianDetails(row.original.slug)}
        >
          {dtsiPersonFullName(row.original)}
        </InternalLink>
      </LinkBox>
    ),
    header: ({ column }) => {
      return <SortableHeader column={column}>Name</SortableHeader>
    },
  }),
  personColumnHelper.accessor(
    row => {
      const score = row.manuallyOverriddenStanceScore || row.computedStanceScore
      if (isNil(score)) {
        return -1
      }
      return score
    },
    {
      id: PERSON_TABLE_COLUMNS_IDS.STANCE,
      filterFn: PERSON_TABLE_COLUMNS_IDS.STANCE,
      header: ({ column }) => {
        return (
          <SortableHeader column={column}>
            <span>Stance</span> <span className="ml-1 hidden md:inline-block">on crypto</span>
          </SortableHeader>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DTSIFormattedLetterGrade className="h-7 w-7" person={row.original} />
          <span className="hidden md:inline">
            {convertDTSIPersonStanceScoreToCryptoSupportLanguage(row.original)}
          </span>
        </div>
      ),
    },
  ),
  personColumnHelper.accessor(
    row => (row.primaryRole ? getDTSIPersonRoleCategoryDisplayName(row.primaryRole) : '-'),
    {
      id: PERSON_TABLE_COLUMNS_IDS.ROLE,
      filterFn: PERSON_TABLE_COLUMNS_IDS.ROLE,
      header: ({ column }) => {
        return <SortableHeader column={column}>Role</SortableHeader>
      },
      cell: ({ row }) => (
        <>
          {row.original.primaryRole
            ? getDTSIPersonRoleCategoryDisplayName(row.original.primaryRole)
            : '-'}
        </>
      ),
    },
  ),
  personColumnHelper.accessor(
    row =>
      row.primaryRole?.primaryState
        ? `${getUSStateNameFromStateCode(row.primaryRole.primaryState)} ${
            row.primaryRole.primaryState
          }`
        : '-',
    {
      id: PERSON_TABLE_COLUMNS_IDS.STATE,
      filterFn: PERSON_TABLE_COLUMNS_IDS.STATE,
      header: ({ column }) => {
        return <SortableHeader column={column}>Location</SortableHeader>
      },
      cell: ({ row }) =>
        row.original.primaryRole?.primaryState
          ? getUSStateNameFromStateCode(row.original.primaryRole.primaryState)
          : '-',
    },
  ),
  personColumnHelper.accessor('politicalAffiliationCategory', {
    id: PERSON_TABLE_COLUMNS_IDS.PARTY,
    filterFn: PERSON_TABLE_COLUMNS_IDS.PARTY,
    header: ({ column }) => {
      return <SortableHeader column={column}>Party</SortableHeader>
    },
    cell: ({ row }) => (
      <>
        {row.original.politicalAffiliationCategory
          ? dtsiPersonPoliticalAffiliationCategoryDisplayName(
              row.original.politicalAffiliationCategory,
            )
          : '-'}
      </>
    ),
  }),
]
