import { MAX_MINOR_MILESTONES_ALLOWED } from '@/inngest/functions/stateLevelBillsCronJob/utils/config'
import {
  BILL_MAJOR_MILESTONE_TITLE_MAP,
  QUORUM_BILL_REGION_MAP,
  QUORUM_BILL_STATUS_TO_CATEGORY_MAP,
  QUORUM_BILL_STATUSES,
  QUORUM_HOUSE_BILL_TYPES,
  QUORUM_SENATE_BILL_TYPES,
} from '@/inngest/functions/stateLevelBillsCronJob/utils/constants'
import { ResolveFieldsMap } from '@/inngest/functions/stateLevelBillsCronJob/utils/types'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { BillChamberOrigin, BillKeyDateCategory, BillSource } from '@/utils/shared/zod/getSWCBills'

export const resolveFields: ResolveFieldsMap = {
  analysis: () => '',

  auAdministrativeAreaLevel1: () => undefined,

  billNumber: bill => {
    const number = bill.label || `${bill.bill_type} ${bill.number}`
    return number.replace(/\s/g, '').replace(/\./g, '-')
  },

  caAdministrativeAreaLevel1: () => undefined,

  chamberOrigin: bill => {
    if (QUORUM_HOUSE_BILL_TYPES.includes(bill.bill_type)) {
      return BillChamberOrigin.LOWER_CHAMBER
    }
    if (QUORUM_SENATE_BILL_TYPES.includes(bill.bill_type)) {
      return BillChamberOrigin.UPPER_CHAMBER
    }
    throw new Error(`Unknown chamber origin for bill type: ${bill.bill_type}`)
  },

  countryCode: () => SupportedCountryCodes.US.toUpperCase(),

  ctaButton: () => ({}),

  dateIntroduced: bill => bill.introduced_date,

  dtsiSlug: () => undefined,

  externalId: bill => String(bill.id),

  gbAdministrativeAreaLevel1: () => undefined,

  isAutomaticUpdatesEnabled: () => true,

  isKeyBill: () => false,

  keyDates: bill =>
    (bill.major_actions || [])
      .map(action => {
        const category =
          QUORUM_BILL_STATUS_TO_CATEGORY_MAP[
            action.status as keyof typeof QUORUM_BILL_STATUS_TO_CATEGORY_MAP
          ] || BillKeyDateCategory.OTHER
        const isMajorMilestone = category !== BillKeyDateCategory.OTHER
        const title =
          QUORUM_BILL_STATUSES[action.status as keyof typeof QUORUM_BILL_STATUSES] || 'Action'

        return {
          category,
          date: action.acted_at,
          description: action.text,
          isMajorMilestone,
          title: isMajorMilestone ? BILL_MAJOR_MILESTONE_TITLE_MAP[category] || title : title,
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter((_, index, keyDates) => {
        const parentMajorMilestoneIndex = keyDates
          .slice(0, index)
          .findLastIndex(({ isMajorMilestone }) => isMajorMilestone)

        return index - parentMajorMilestoneIndex <= MAX_MINOR_MILESTONES_ALLOWED
      }),

  mostRecentActionDate: bill => bill.most_recent_action_date,

  officialBillUrl: bill => bill.source_link,

  relatedUrls: () => [],

  source: () => BillSource.QUORUM,

  summary: bill => {
    const summary = bill.summaries.at(-1)

    if (!summary) {
      return ''
    }

    return `<p>${summary.content.replace(/\\n/gm, '<br />') || ''}</p>`
  },

  timelineDescription: bill => bill.major_actions?.[0]?.text || '',

  title: bill => bill.title,

  usAdministrativeAreaLevel1: bill => {
    if (bill.region === 1) {
      return undefined // Federal bill
    }

    const stateNameExclusions = [
      'Assembly',
      'Council of the',
      'Court',
      'General',
      'Legislative',
      'Legislature',
      'Local',
      'State',
    ]

    const regionName = QUORUM_BILL_REGION_MAP[bill.region as keyof typeof QUORUM_BILL_REGION_MAP]
    const stateName = stateNameExclusions.reduce(
      (name, phrase) => name.replace(phrase, '').trim(),
      regionName,
    )
    const state = Object.entries(US_STATE_CODE_TO_DISPLAY_NAME_MAP).find(
      ([_, name]) => name.toLowerCase() === stateName.toLowerCase(),
    )

    if (!state) {
      throw new Error(`Unknown US state for bill region: ${regionName}`)
    }
    return state[0]
  },
}
