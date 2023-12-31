'use client'
import { ClientUser } from '@/clientModels/clientUser/clientUser'
import { ClientUserAction } from '@/clientModels/clientUserAction/clientUserAction'
import { LazyUserActionFormOptInSWC } from '@/components/app/userActionFormOptInSWC/lazyLoad'
import { UserAvatar } from '@/components/app/userAvatar'
import { Button } from '@/components/ui/button'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { FormattedRelativeDatetime } from '@/components/ui/formattedRelativeDatetime'
import { DTSIPersonForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import { SupportedLocale } from '@/intl/locales'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { formatDonationOrganization } from '@/utils/web/donationUtils'
import { getUserDisplayName } from '@/utils/web/userUtils'
import { UserActionOptInType, UserActionType } from '@prisma/client'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import React, { Suspense } from 'react'
import { usePerformedUserActionTypes } from '@/hooks/usePerformedUserActionTypes'
import { LazyUserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson/lazyLoad'
import { LazyUserActionFormDonate } from '@/components/app/userActionFormDonate/lazyLoad'
import { LazyUserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson/lazyLoad'
import { LazyUserActionFormNFTMint } from '@/components/app/userActionFormNFTMint/lazyLoad'
import { LazyUserActionFormTweet } from '@/components/app/userActionFormTweet/lazyLoad'
import { useIsMobile } from '@/hooks/useIsMobile'

interface RecentActivityRowProps {
  action: ClientUserAction & { user: ClientUser }
  locale: SupportedLocale
}

function RecentActivityRowBase({
  locale,
  action,
  children,
  onFocusContent,
}: RecentActivityRowProps & { children: React.ReactNode; onFocusContent?: () => React.ReactNode }) {
  const [hasFocus, setHasFocus] = React.useState(false)
  const isMobile = useIsMobile()
  return (
    <div
      // added min height to prevent height shifting on hover
      className="flex min-h-[41px] items-center justify-between gap-5"
      onMouseEnter={() => isMobile || setHasFocus(true)}
      onMouseLeave={() => isMobile || setHasFocus(false)}
    >
      <div className="flex items-center gap-2">
        <div>
          <UserAvatar size={30} user={action.user} />
        </div>
        <div>{children}</div>
      </div>
      <div className="shrink-0 text-xs text-gray-500">
        {/* TODO add animation */}
        {hasFocus && onFocusContent ? (
          onFocusContent?.()
        ) : (
          <>
            <span className="hidden md:inline">
              <FormattedRelativeDatetime date={action.datetimeCreated} locale={locale} />
            </span>
            <span className="inline md:hidden">
              <FormattedRelativeDatetime
                timeFormatStyle="narrow"
                date={action.datetimeCreated}
                locale={locale}
              />
            </span>
          </>
        )}
      </div>
    </div>
  )
}

const MainText = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm font-bold text-gray-900">{children}</div>
)
const SubText = ({ children }: { children: React.ReactNode }) => (
  <div className="hidden text-xs text-gray-500 md:block">{children}</div>
)

const formatDTSIPerson = (person: DTSIPersonForUserActions) => {
  // TODO add their current role
  const politicalAffiliation = person.politicalAffiliationCategory
    ? `(${dtsiPersonPoliticalAffiliationCategoryAbbreviation(person.politicalAffiliationCategory)})`
    : ''
  return `${dtsiPersonFullName(person)} ${politicalAffiliation}`
}

export function RecentActivityRow(props: RecentActivityRowProps) {
  const { action, locale } = props
  const userDisplayName = getUserDisplayName(props.action.user)
  const { data } = usePerformedUserActionTypes()
  const hasSignedUp = data?.performedUserActionTypes.includes(UserActionType.OPT_IN)
  const getActionSpecificProps = () => {
    switch (action.actionType) {
      case UserActionType.OPT_IN: {
        const getTypeDisplayText = () => {
          switch (action.optInType) {
            case UserActionOptInType.SWC_SIGN_UP:
              return 'joined Stand With Crypto'
          }
        }
        return {
          onFocusContent: hasSignedUp
            ? undefined
            : () => (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Join</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <Suspense>
                      <LazyUserActionFormOptInSWC />
                    </Suspense>
                  </DialogContent>
                </Dialog>
              ),
          children: (
            <>
              <MainText>
                {userDisplayName} {getTypeDisplayText()}
              </MainText>
            </>
          ),
        }
      }
      case UserActionType.CALL:
        return {
          onFocusContent: () => (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Call yours</Button>
              </DialogTrigger>
              <DialogContent>
                <Suspense>
                  <LazyUserActionFormCallCongressperson />
                </Suspense>
              </DialogContent>
            </Dialog>
          ),
          children: (
            <>
              <MainText>{userDisplayName} called their representative</MainText>
              <SubText>{formatDTSIPerson(action.person)}</SubText>
            </>
          ),
        }
      case UserActionType.DONATION:
        return {
          onFocusContent: () => (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Donate</Button>
              </DialogTrigger>
              <DialogContent>
                <Suspense>
                  <LazyUserActionFormDonate />
                </Suspense>
              </DialogContent>
            </Dialog>
          ),
          children: (
            <>
              <MainText>{userDisplayName} donated</MainText>
              <SubText>
                <FormattedCurrency
                  amount={action.amount}
                  currencyCode={action.amountCurrencyCode}
                  locale={locale}
                />{' '}
                to {formatDonationOrganization(action.recipient)}
              </SubText>
            </>
          ),
        }
      case UserActionType.EMAIL:
        return {
          onFocusContent: () => (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Email yours</Button>
              </DialogTrigger>
              <DialogContent>
                <Suspense>
                  <LazyUserActionFormEmailCongressperson />
                </Suspense>
              </DialogContent>
            </Dialog>
          ),
          children: (
            <>
              <MainText>
                {userDisplayName} emailed their representative
                {action.userActionEmailRecipients.length > 1 ? 's' : ''}
              </MainText>
              <SubText>
                {action.userActionEmailRecipients.map(x => formatDTSIPerson(x.person)).join(', ')}
              </SubText>
            </>
          ),
        }
      case UserActionType.NFT_MINT: {
        return {
          onFocusContent: () => (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Mint yours</Button>
              </DialogTrigger>
              <DialogContent>
                <Suspense>
                  <LazyUserActionFormNFTMint />
                </Suspense>
              </DialogContent>
            </Dialog>
          ),
          children: <MainText>{userDisplayName} donated by minting an NFT</MainText>,
        }
      }
      case UserActionType.TWEET: {
        return {
          onFocusContent: () => (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Tweet</Button>
              </DialogTrigger>
              <DialogContent>
                <Suspense>
                  <LazyUserActionFormTweet />
                </Suspense>
              </DialogContent>
            </Dialog>
          ),
          children: <MainText>{userDisplayName} tweeted in support of crypto</MainText>,
        }
      }
    }
    return gracefullyError({
      // @ts-ignore
      msg: `Unknown action type in RecentActivityRow for action ${action.id}: ${action.actionType}`,
      fallback: 'helped crypto',
    })
  }
  return <RecentActivityRowBase action={action} locale={locale} {...getActionSpecificProps()} />
}
