import { DTSIAvatar, DTSIAvatarProps } from '@/components/app/dtsiAvatar'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { DTSI_Person, Maybe } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import {
  DTSIPersonRoleCategoryDisplayNameProps,
  getDTSIPersonRoleCategoryDisplayName,
} from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface DTSIAvatarBoxProps extends DTSIAvatarProps {
  locale: SupportedLocale
  person: DTSIAvatarProps['person'] &
    Pick<DTSI_Person, 'slug' | 'politicalAffiliationCategory'> & {
      primaryRole: Maybe<DTSIPersonRoleCategoryDisplayNameProps>
    }
  prefetch?: boolean
}

export const DTSIAvatarBox = (props: DTSIAvatarBoxProps) => {
  const { person, locale, prefetch = false, ...avatarProps } = props
  const politicalAffiliationCategoryAbbr =
    person.politicalAffiliationCategory &&
    dtsiPersonPoliticalAffiliationCategoryAbbreviation(person.politicalAffiliationCategory)
  return (
    <LinkBox className="flex w-fit flex-col items-center gap-2 text-center">
      <DTSIAvatar className="rounded-full" person={person} {...avatarProps} />
      <div>
        <InternalLink
          className={cn(linkBoxLinkClassName, 'cursor-pointer font-semibold')}
          data-link-box-subject
          href={getIntlUrls(locale).politicianDetails(person.slug)}
          prefetch={prefetch}
        >
          {dtsiPersonFullName(person)}
          {!!politicalAffiliationCategoryAbbr && ` (${politicalAffiliationCategoryAbbr})`}
        </InternalLink>
        <p className="text-sm text-fontcolor-muted">
          {person.primaryRole ? getDTSIPersonRoleCategoryDisplayName(person.primaryRole) : '-'}
        </p>
      </div>
    </LinkBox>
  )
}
