import { DTSI_BillPersonRelationshipType } from '@/data/dtsi/generated'

export const dtsiPersonBillRelationshipTypeAsVerb = (relType: DTSI_BillPersonRelationshipType) => {
  switch (relType) {
    case DTSI_BillPersonRelationshipType.COSPONSOR:
      return 'cosponsored'
    case DTSI_BillPersonRelationshipType.SPONSOR:
      return 'sponsored'
    case DTSI_BillPersonRelationshipType.VOTED_FOR:
      return 'voted for'
    case DTSI_BillPersonRelationshipType.VOTED_AGAINST:
      return 'voted against'
    default:
      return 'related to'
  }
}
