import 'server-only'

import { BillDetails, BillFromDTSI } from '@/data/bills/types'
import { mergeBillFromBuilderIOAndDTSI } from '@/data/bills/utils/merge'
import {
  DTSI_BillPersonRelationshipType,
  DTSI_BillVotePersonPositionType,
} from '@/data/dtsi/generated'
import { queryDTSIBillDetails } from '@/data/dtsi/queries/queryDTSIBillDetails'
import {
  getBillFromBuilderIOByBillNumber,
  getBillFromBuilderIOByDTSISlug,
} from '@/utils/server/builder/models/data/bills'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const groupBillStancesByPerson = (bill: BillFromDTSI) => {
  const sponsors = []
  const coSponsors = []
  const votedFor = []
  const votedAgainst = []

  for (const relationship of bill.sponsorshipRelationships) {
    if (relationship.relationshipType === DTSI_BillPersonRelationshipType.SPONSOR) {
      sponsors.push(relationship.person)
    } else {
      coSponsors.push(relationship.person)
    }
  }

  for (const personPosition of bill?.latestVote?.personPositions || []) {
    if (personPosition.positionType === DTSI_BillVotePersonPositionType.YES) {
      votedFor.push(personPosition.person)
    } else {
      votedAgainst.push(personPosition.person)
    }
  }

  return { sponsors, coSponsors, votedFor, votedAgainst }
}

export async function getBill(
  countryCode: SupportedCountryCodes,
  billNumberOrDTSISlug: string,
): Promise<BillDetails | null> {
  let billFromBuilderIO = await getBillFromBuilderIOByBillNumber(countryCode, billNumberOrDTSISlug)

  if (!billFromBuilderIO) {
    billFromBuilderIO = await getBillFromBuilderIOByDTSISlug(countryCode, billNumberOrDTSISlug)
  }

  if (!billFromBuilderIO) {
    return null
  }

  let billFromDTSI: BillFromDTSI | null | undefined = null
  if (billFromBuilderIO.dtsiSlug) {
    billFromDTSI = (await queryDTSIBillDetails(
      billFromBuilderIO.dtsiSlug,
    )) as unknown as BillFromDTSI // TODO: fix this type
  }

  const billData = mergeBillFromBuilderIOAndDTSI(billFromBuilderIO, billFromDTSI) as BillDetails

  const groupedStances = groupBillStancesByPerson(billFromDTSI!)

  billData.relationships = groupedStances

  return billData
}
