import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIBillCard } from '@/components/app/dtsiBillCard'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { SWCBillCardInfo } from '@/data/bills/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface BillCardProps {
  bill: SWCBillCardInfo
  countryCode: SupportedCountryCodes
}

interface BillsButtonProps {
  children: React.ReactNode
  href: string
}

export function Bills({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex max-w-[600px] flex-col gap-4 lg:gap-8">{children}</div>
}

function BillsCard({ bill, countryCode }: BillCardProps) {
  return (
    <DTSIBillCard bill={bill} countryCode={countryCode}>
      <CryptoSupportHighlight
        className="flex-shrink-0 rounded-full text-base"
        stanceScore={bill.computedStanceScore}
      />
    </DTSIBillCard>
  )
}
Bills.Card = BillsCard

function BillsButton({ children, href }: BillsButtonProps) {
  return (
    <div className="container space-x-4 text-center">
      <Button asChild variant="secondary">
        <InternalLink href={href}>{children}</InternalLink>
      </Button>
    </div>
  )
}
Bills.Button = BillsButton
