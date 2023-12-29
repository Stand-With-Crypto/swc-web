import {
  DTSIStanceDetailsBillRelationshipProp,
  DTSIStanceDetailsStanceProp,
} from '@/components/app/dtsiStanceDetails/types'
import { dtsiPersonBillRelationshipTypeAsVerb } from '@/utils/dtsi/dtsiPersonBillRelationshipUtils'
import { cn } from '@/utils/web/cn'
import { format, parseISO } from 'date-fns'
import _ from 'lodash'
import { Gavel } from 'lucide-react'
import React from 'react'

export interface IStanceDetailsBillRelationshipProps {
  stance: DTSIStanceDetailsStanceProp<DTSIStanceDetailsBillRelationshipProp>
  className?: string
}

const StanceDetailsBillRelationshipShared: React.FC<
  IStanceDetailsBillRelationshipProps & { children: React.ReactNode }
> = ({ children, stance, className }) => {
  return (
    <div className={cn('rounded-lg bg-white p-4 text-gray-800 lg:text-xl', className)}>
      <div className="mb-5">{children}</div>
      {[
        { label: 'Bill Name', details: stance.billRelationship.bill.shortTitle },
        {
          label: 'Details',
          details: stance.billRelationship.bill.summary || stance.billRelationship.bill.title,
        },
      ].map((x, i) => (
        <React.Fragment key={i}>
          {!!i && <hr className="mx-auto my-4 w-[50%] border border-gray-100" />}
          <div className={cn('flex flex-col items-center md:flex-row')}>
            <div className="w-full flex-none font-bold md:w-[120px]">{x.label}</div>
            <div className="text-sm">{x.details}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export const DTSIStanceDetailsBillRelationship: React.FC<
  IStanceDetailsBillRelationshipProps
> = props => {
  const { stance } = props
  return (
    <StanceDetailsBillRelationshipShared {...props}>
      <div className="flex items-center">
        <Gavel className="mr-2 inline-block h-6 w-6" />
        <div>
          <span className="font-bold">
            {_.upperFirst(
              dtsiPersonBillRelationshipTypeAsVerb(stance.billRelationship.relationshipType),
            )}
          </span>{' '}
          a bill on <span>{format(parseISO(stance.dateStanceMade), 'MMM do, yyyy')}</span>
        </div>
      </div>
    </StanceDetailsBillRelationshipShared>
  )
}
