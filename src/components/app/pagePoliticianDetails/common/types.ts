import { DTSIPersonDetails, DTSIPersonStance } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import { NormalizedQuestionnaire } from '@/utils/server/builder/models/data/questionnaire'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export type BillStance = Omit<DTSIPersonStance, 'quote' | 'tweet'> & {}

export interface BillData {
  id: string
  bill: NonNullable<DTSIPersonStance['billRelationship']>['bill']
  dateForSorting: string | undefined
  stances: BillStance[]
}

export type BillsMap = Record<string, BillData>

export interface PoliticianDetails extends Omit<DTSIPersonDetails, 'stances'> {
  stancesCount: number
  statementsCount: number
  votesCount: number
  stances: {
    bills: BillData[]
    noBills: DTSIPersonStance[]
  }
}

export interface PoliticianDetailsPageProps {
  person: PoliticianDetails
  countryCode: SupportedCountryCodes
  questionnaire: NormalizedQuestionnaire | null
}
