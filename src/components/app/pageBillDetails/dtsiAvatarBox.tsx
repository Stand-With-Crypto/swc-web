import { DTSIAvatar, DTSIAvatarProps } from '@/components/app/dtsiAvatar'
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

interface DTSIAvatarBoxProps extends DTSIAvatarProps {
  countryCode: SupportedCountryCodes
  person: DTSIAvatarProps['person'] &
    Pick<DTSI_Person, 'slug' | 'politicalAffiliationCategory'> & {
      primaryRole: Maybe<DTSIPersonRoleCategoryDisplayNameProps>
    }
  prefetch?: boolean
}

export const DTSIAvatarBox = (props: DTSIAvatarBoxProps) => {
  const { person, countryCode, prefetch = false, ...avatarProps } = props
  const politicalAffiliationCategoryAbbr =
    person.politicalAffiliationCategory &&
    dtsiPersonPoliticalAffiliationCategoryAbbreviation(person.politicalAffiliationCategory)
  const roleNameResolver = getRoleNameResolver(countryCode)
  return (
    <LinkBox className="flex w-fit flex-col items-center gap-2 text-center">
      <DTSIAvatar className="rounded-full" person={person} {...avatarProps} />
      <div>
        <InternalLink
          className={cn(linkBoxLinkClassName, 'cursor-pointer font-semibold')}
          data-link-box-subject
          href={getIntlUrls(countryCode).politicianDetails(person.slug)}
          prefetch={prefetch}
        >
          {dtsiPersonFullName(person)}
          {!!politicalAffiliationCategoryAbbr && ` (${politicalAffiliationCategoryAbbr})`}
        </InternalLink>
        <p className="text-sm text-fontcolor-muted">
          {person.primaryRole ? roleNameResolver(person.primaryRole) : '-'}
        </p>
      </div>
    </LinkBox>
  )
}
