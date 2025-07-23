import { cache } from 'react'

import { BillsMap } from '@/components/app/pagePoliticianDetails/common/types'
import { DTSI_Bill, DTSI_PersonStanceType } from '@/data/dtsi/generated'
import {
  DTSIPersonStance,
  queryDTSIPersonDetails,
} from '@/data/dtsi/queries/queryDTSIPersonDetails'

const transformBillsInArrayAndSortByDate = (bills: BillsMap) => {
  return Object.values(bills)
    .map(bill => {
      const sortedStances = bill.stances.sort(
        (a, b) => new Date(a.dateStanceMade).getTime() - new Date(b.dateStanceMade).getTime(),
      )
      return { ...bill, stances: sortedStances }
    })
    .sort(
      (a, b) =>
        new Date(b.dateForSorting || '').getTime() - new Date(a.dateForSorting || '').getTime(),
    )
}

const groupStancesByBill = (stances: DTSIPersonStance[]) => {
  const noBills: DTSIPersonStance[] = []
  const bills: BillsMap = {}

  for (const stance of stances) {
    if (stance.stanceType === DTSI_PersonStanceType.BILL_RELATIONSHIP) {
      const { billRelationship, quote: _quote, tweet: _tweet, ...rest } = stance

      const bill = billRelationship?.bill as DTSI_Bill

      const newStance = { ...rest, billRelationship }

      const billId = bill?.id || ''

      if (!bills[billId]) {
        bills[billId] = {
          id: billId,
          bill,
          dateForSorting: bill?.dateIntroduced,
          stances: [newStance],
        }
      } else {
        bills[billId].stances.push(newStance)
      }
    } else {
      noBills.push(stance)
    }
  }

  return {
    bills: transformBillsInArrayAndSortByDate(bills),
    noBills,
  }
}

export const getPoliticianDetailsData = cache(async (dtsiSlug: string) => {
  const person = await queryDTSIPersonDetails(dtsiSlug).catch(error => {
    console.error(`Failed to fetch politician details for slug: ${dtsiSlug}`, error)
    return null
  })
  if (!person) return person

  const { bills, noBills } = groupStancesByBill(person.stances)

  const stancesCount = person.stances.length

  return { ...person, stancesCount, stances: { bills, noBills } }
})
