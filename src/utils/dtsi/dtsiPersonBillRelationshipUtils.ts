import { DTSI_BillPersonRelationshipType } from '@/data/dtsi/generated'

export const dtsiPersonBillRelationshipTypeAsVerb = (relType: DTSI_BillPersonRelationshipType) => {
  switch (relType) {
    case DTSI_BillPersonRelationshipType.COSPONSOR:
      return 'cosponsored'
    case DTSI_BillPersonRelationshipType.SPONSOR:
      return 'sponsored'
  }
}
