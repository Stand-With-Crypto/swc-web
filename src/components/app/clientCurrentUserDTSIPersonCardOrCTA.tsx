'use client'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { LazyUserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson/lazyLoad'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { SupportedLocale } from '@/intl/locales'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { possessive } from '@/utils/shared/possessive'
import { getIntlUrls } from '@/utils/shared/urls'
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog'
import { Suspense, useState } from 'react'

export function ClientCurrentUserDTSIPersonCardOrCTA({ locale }: { locale: SupportedLocale }) {
  const [mockAddress, setMockAddress] = useState('')
  const res = useGetDTSIPeopleFromAddress(mockAddress)
  if (!res.data) {
    return (
      <Button
        className="m-auto block"
        onClick={() => {
          mockAddress ? setMockAddress('') : setMockAddress('15 E 7th St, New York NY, 10003')
        }}
      >
        Find your representative (TODO, press for demo)
      </Button>
    )
  }
  if ('notFoundReason' in res.data) {
    return null
  }
  const person = res.data
  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-md border bg-blue-50 p-5 text-left md:flex-row md:gap-10">
      <div className="flex flex-row items-center gap-4 text-sm md:text-base">
        <div className="relative">
          <DTSIAvatar person={person} size={60} />
          <div className="absolute bottom-[-8px] right-[-8px]">
            <DTSIFormattedLetterGrade size={25} person={person} />
          </div>
        </div>
        <div>
          <div className="font-bold">Your representative is {dtsiPersonFullName(person)}</div>
          <div className="text-fontcolor-muted">
            {/* TODO this needs different copy/UX if they're pro crypto */}
            Learn how to change {possessive(person.firstNickname || person.firstName)} stance on
            crypto.
          </div>
        </div>
      </div>
      <div className="flex gap-5 md:gap-2">
        <UserActionFormCallCongresspersonDialog>
          <Button size="lg">Call</Button>
        </UserActionFormCallCongresspersonDialog>
        <Button variant="secondary" asChild>
          <InternalLink href={getIntlUrls(locale).politicianDetails(person.slug)}>
            View profile
          </InternalLink>
        </Button>
      </div>
    </div>
  )
}
