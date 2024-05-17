import { DTSIAvatar, DTSIAvatarProps } from '@/components/app/dtsiAvatar'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { DTSI_Person, DTSI_PersonRole, Maybe } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { getDTSIPersonRoleCategoryDisplayName } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface DTSIAvatarBoxProps extends DTSIAvatarProps {
  locale: SupportedLocale
  person: DTSIAvatarProps['person'] &
    Pick<DTSI_Person, 'slug'> & {
      primaryRole: Maybe<
        Pick<DTSI_PersonRole, 'roleCategory' | 'title' | 'status' | 'primaryState'>
      >
    }
}

export const DTSIAvatarBox = (props: DTSIAvatarBoxProps) => {
  const { person, locale, ...avatarProps } = props

  return (
    <LinkBox className="flex w-fit flex-col items-center gap-2">
      <DTSIAvatar className="rounded-full" person={person} {...avatarProps} />
      <InternalLink
        className={cn(linkBoxLinkClassName, 'cursor-pointer font-semibold')}
        data-link-box-subject
        href={getIntlUrls(locale).politicianDetails(person.slug)}
      >
        {dtsiPersonFullName(person)}
      </InternalLink>
      <p className="text-sm  text-fontcolor-muted">
        {person.primaryRole ? getDTSIPersonRoleCategoryDisplayName(person.primaryRole) : '-'}
      </p>
    </LinkBox>
  )
}
