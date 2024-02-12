'use client'

import { ColumnDef } from '@tanstack/react-table'

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
import { convertDTSIStanceScoreToCryptoSupportLanguage } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'

export type Person = Awaited<ReturnType<typeof queryDTSIAllPeople>>['people'][0]

export const getDTSIClientPersonDataTableColumns = ({
  locale,
}: {
  locale: SupportedLocale
}): ColumnDef<Person>[] => [
  {
    accessorKey: 'fullName',
    accessorFn: row => dtsiPersonFullName(row),
    cell: ({ row }) => (
      <LinkBox className="flex items-center gap-3">
        <DTSIAvatar person={row.original} size={40} />
        <InternalLink
          className={linkBoxLinkClassName}
          href={getIntlUrls(locale).politicianDetails(row.original.slug)}
        >
          {dtsiPersonFullName(row.original)}
        </InternalLink>
      </LinkBox>
    ),
    header: ({ column }) => {
      return <SortableHeader column={column}>Name</SortableHeader>
    },
  },
  {
    accessorKey: 'swcStanceScore',
    accessorFn: row => row.manuallyOverriddenStanceScore || row.computedStanceScore,
    header: ({ column }) => {
      return (
        <SortableHeader column={column}>
          <span>Stance</span> <span className="ml-1 hidden md:inline-block">on crypto</span>
        </SortableHeader>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <DTSIFormattedLetterGrade person={row.original} size={30} />
        <span className="hidden md:inline">
          {convertDTSIStanceScoreToCryptoSupportLanguage(row.original)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'personRoleCategoryDisplayName',
    accessorFn: row =>
      row.primaryRole ? getDTSIPersonRoleCategoryDisplayName(row.primaryRole) : '-',
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
  {
    accessorKey: 'primaryStateCodeWithDisplayName',
    accessorFn: row =>
      row.primaryRole?.primaryState
        ? `${getUSStateNameFromStateCode(row.primaryRole.primaryState)} ${
            row.primaryRole.primaryState
          }`
        : '-',
    header: ({ column }) => {
      return <SortableHeader column={column}>Location</SortableHeader>
    },
    cell: ({ row }) =>
      row.original.primaryRole?.primaryState
        ? getUSStateNameFromStateCode(row.original.primaryRole.primaryState)
        : '-',
  },
  {
    accessorKey: 'politicalAffiliationCategory',
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
  },
]
