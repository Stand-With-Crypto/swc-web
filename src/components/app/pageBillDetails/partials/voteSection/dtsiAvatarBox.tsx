import { motion } from 'motion/react'

import { DTSIAvatar, DTSIAvatarProps } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { DTSI_Person, Maybe } from '@/data/dtsi/generated'
import {
  DTSIPersonRoleCategoryDisplayNameProps,
  getRoleNameResolver,
} from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface DTSIAvatarBoxProps extends Omit<DTSIAvatarProps, 'size'> {
  countryCode: SupportedCountryCodes
  person: DTSIAvatarProps['person'] &
    Pick<
      DTSI_Person,
      | 'slug'
      | 'politicalAffiliationCategory'
      | 'computedStanceScore'
      | 'manuallyOverriddenStanceScore'
      | 'computedSumStanceScoreWeight'
    > & {
      primaryRole: Maybe<DTSIPersonRoleCategoryDisplayNameProps>
    }
  prefetch?: boolean
  className?: string
}

const AVATAR_SIZE = 90

export const DTSIAvatarBox = (props: DTSIAvatarBoxProps) => {
  const { person, countryCode, prefetch = false, className, ...avatarProps } = props

  const politicalAffiliationCategoryAbbr =
    person.politicalAffiliationCategory &&
    dtsiPersonPoliticalAffiliationCategoryAbbreviation(person.politicalAffiliationCategory)
  const roleNameResolver = getRoleNameResolver(countryCode)

  return (
    <LinkBox
      className={cn(
        'flex h-[188px] w-full min-w-[160px] flex-col items-center gap-2 rounded-xl bg-muted p-4 text-center transition-all hover:bg-slate-300 sm:max-w-[200px]',
        className,
      )}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0.33 }}
        key={person.slug}
        transition={{ duration: 0.75 }}
      >
        <div className="relative mx-auto w-fit">
          <DTSIAvatar
            className="rounded-full"
            person={person}
            size={AVATAR_SIZE}
            {...avatarProps}
          />
          <DTSIFormattedLetterGrade className="absolute bottom-1 right-1 h-6 w-6" person={person} />
        </div>

        <div className="text-sm">
          <InternalLink
            className={cn(linkBoxLinkClassName, 'cursor-pointer text-sm font-semibold')}
            data-link-box-subject
            href={getIntlUrls(countryCode).politicianDetails(person.slug)}
            prefetch={prefetch}
          >
            {dtsiPersonFullName(person)}
          </InternalLink>
          <p className="text-sm text-fontcolor-muted">
            {!!politicalAffiliationCategoryAbbr && `(${politicalAffiliationCategoryAbbr}) `}
            {person.primaryRole ? roleNameResolver(person.primaryRole) : '-'}
          </p>
        </div>
      </motion.div>
    </LinkBox>
  )
}
