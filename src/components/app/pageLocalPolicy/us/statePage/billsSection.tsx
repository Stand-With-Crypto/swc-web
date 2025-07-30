import { Bills } from '@/components/app/pageLocalPolicy/common/statePage/billsSection'
import { Section } from '@/components/app/pageLocalPolicy/common/statePage/section'
import { SWCBillCardInfo } from '@/data/bills/types'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const ITEMS_PER_PAGE = 5

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const urls = getIntlUrls(countryCode)

interface UsBillsSectionProps {
  bills: SWCBillCardInfo[]
  stateCode: string
  stateName: string
}

export async function UsBillsSection({ bills, stateCode, stateName }: UsBillsSectionProps) {
  const total = bills.length

  return (
    total > 0 && (
      <Section>
        <Section.Title>Bills</Section.Title>
        <Section.SubTitle>Learn about crypto bills being voted on in {stateName}</Section.SubTitle>

        <Bills>
          {bills.slice(0, ITEMS_PER_PAGE).map(bill => (
            <Bills.Card bill={bill} countryCode={countryCode} key={bill.billNumberOrDTSISlug} />
          ))}

          {total > ITEMS_PER_PAGE && (
            <Bills.Button href={urls.billsStateSpecific(stateCode)}>View all</Bills.Button>
          )}
        </Bills>
      </Section>
    )
  )
}
