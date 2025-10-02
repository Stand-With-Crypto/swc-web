import { UserActionCardProps } from '@/components/app/userActionGridCTAs/types'
import { NextImage } from '@/components/ui/image'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { cn } from '@/utils/web/cn'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

import { CampaignsCheckmarks } from './campaignsCheckmarks'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      complete: 'Complete',
      lowercaseComplete: 'complete',
      notComplete: 'Not complete',
    },
    fr: {
      complete: 'Complet',
      lowercaseComplete: 'complet',
      notComplete: 'Non complet',
    },
    de: {
      complete: 'Vollständig',
      lowercaseComplete: 'vollständig',
      notComplete: 'Nicht vollständig',
    },
  },
})

export function SuccessScreenActionCard({
  title,
  image,
  description,
  completedCampaigns,
  campaignsLength,
  campaigns,
  performedUserActions,
  mobileCTADescription,
  link: _link,
  campaignsModalDescription: _campaignsModalDescription,
  onClick: _onClick,
  ...rest
}: Omit<UserActionCardProps, 'WrapperComponent'>) {
  const { t } = useTranslation(i18nMessages, 'SuccessScreenActionCard')

  const isReadOnly = campaigns.every(
    campaign =>
      !campaign.canBeTriggeredMultipleTimes &&
      performedUserActions[`${campaign.actionType}-${campaign.campaignName}`],
  )

  const getProgressText = () => {
    if (campaignsLength === 1) {
      return completedCampaigns === 1 ? t('complete') : t('notComplete')
    }

    return `${completedCampaigns}/${campaignsLength} ${t('lowercaseComplete')}`
  }

  return (
    <button
      {...rest}
      className={cn(
        'flex w-full cursor-pointer flex-row-reverse items-stretch rounded-3xl transition-shadow hover:shadow-lg',
        isReadOnly && 'pointer-events-none cursor-default',
      )}
      onClick={_onClick}
    >
      <div className="bg-circular-gradient flex h-auto min-h-36 min-w-32 max-w-32 items-center justify-center rounded-br-3xl rounded-tr-3xl px-5 py-9">
        <NextImage alt={title} height={80} objectFit="contain" src={image} width={80} />
      </div>
      <div className="flex w-full flex-col items-start justify-between gap-3 rounded-bl-3xl rounded-tl-3xl bg-muted px-4 py-4">
        <strong className="text-left font-sans text-sm font-bold lg:text-xl">{title}</strong>
        <p className="hidden text-left text-sm text-muted-foreground lg:block lg:text-base">
          {description}
        </p>
        <p className="text-left text-sm text-muted-foreground lg:hidden lg:text-base">
          {mobileCTADescription ?? description}
        </p>

        <div className="mt-auto flex w-full items-center gap-2 pt-5">
          <CampaignsCheckmarks
            campaignsLength={campaignsLength}
            completedCampaigns={completedCampaigns}
          />
          <span className="text-xs lg:text-base">{getProgressText()}</span>
        </div>
      </div>
    </button>
  )
}
