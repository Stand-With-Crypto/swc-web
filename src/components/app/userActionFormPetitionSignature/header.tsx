import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { PageTitle } from '@/components/ui/pageTitleText'
import { Progress } from '@/components/ui/progress'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { cn } from '@/utils/web/cn'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

import { DEFAULT_INNER_WIDTH_CLASS_NAME } from './constants'

interface PetitionHeaderProps {
  title: string
  petitionSlug?: string
  signaturesCount: number
  goal: number
  className?: string
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      viewPetition: 'View petition',
      signatures: 'Signatures',
      goal: 'Goal',
    },
    de: {
      viewPetition: 'Petition ansehen',
      signatures: 'Unterschriften',
      goal: 'Ziel',
    },
    fr: {
      viewPetition: 'Voir la pétition',
      signatures: 'Signatures',
      goal: 'Objectif',
    },
  },
})

export function PetitionHeader({
  title,
  petitionSlug,
  signaturesCount,
  goal,
  className,
}: PetitionHeaderProps) {
  const { t } = useTranslation(i18nMessages, 'PetitionHeader')

  const pathname = usePathname()
  const urls = useIntlUrls()

  const progressPercentage = Math.min((signaturesCount / goal) * 100, 100)

  const isOnPetitionPage = petitionSlug && pathname?.includes(`/petitions/${petitionSlug}`)

  const handleCloseDialog = () => {
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
    })
    document.dispatchEvent(escapeEvent)
  }

  return (
    <div className={cn('mx-auto w-full pt-12 max-md:px-6', className)}>
      <div className={cn(DEFAULT_INNER_WIDTH_CLASS_NAME)}>
        <div className="space-y-4 py-6">
          <PageTitle size="md">{title}</PageTitle>
          <div className="text-center">
            {petitionSlug ? (
              isOnPetitionPage ? (
                <button
                  className="cursor-pointer text-foreground underline hover:text-foreground/80"
                  onClick={handleCloseDialog}
                  type="button"
                >
                  {t('viewPetition')}
                </button>
              ) : (
                <Link className="underline" href={urls.petitionDetails(petitionSlug)}>
                  {t('viewPetition')}
                </Link>
              )
            ) : (
              <span className="underline">{t('viewPetition')}</span>
            )}
          </div>
        </div>

        <div className="space-y-2 pb-6">
          <Progress className="h-4" value={progressPercentage} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {signaturesCount.toLocaleString()} {t('signatures')}
            </span>
            <span>
              {goal.toLocaleString()} {t('goal')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
