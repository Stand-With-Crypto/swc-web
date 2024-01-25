import {
  DTSIStanceDetailsBillRelationshipProp,
  DTSIStanceDetailsStanceProp,
  IStanceDetailsProps,
} from '@/components/app/dtsiStanceDetails/types'
import { Badge } from '@/components/ui/badge'
import { dtsiPersonBillRelationshipTypeAsVerb } from '@/utils/dtsi/dtsiPersonBillRelationshipUtils'
import _ from 'lodash'
import React from 'react'

type IStanceDetailsBillRelationshipProps = Omit<IStanceDetailsProps, 'stance'> & {
  stance: DTSIStanceDetailsStanceProp<DTSIStanceDetailsBillRelationshipProp>
}

export const DTSIStanceDetailsBillRelationship: React.FC<
  IStanceDetailsBillRelationshipProps
> = props => {
  const { stance } = props
  const { bill } = stance.billRelationship
  return (
    <div>
      <h4 className="mb-1 font-bold">{bill.shortTitle}</h4>
      <div className="mb-2">
        <Badge>
          {_.upperFirst(
            dtsiPersonBillRelationshipTypeAsVerb(stance.billRelationship.relationshipType),
          )}
        </Badge>
      </div>
      <p>{stance.billRelationship.bill.summary || stance.billRelationship.bill.title}</p>
    </div>
  )
}
