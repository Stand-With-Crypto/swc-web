import { Builder } from '@builder.io/react'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { useCountryCode } from '@/hooks/useCountryCode'
import { NewMode, NewModeProps } from '@/utils/web/builder/components/newmode'
import { BuilderComponentBaseProps } from '@/utils/web/builder/types'

Builder.registerComponent(
  (props: BuilderComponentBaseProps & NewModeProps) => {
    const countryCode = useCountryCode()

    if (Builder.isEditing) {
      return (
        <div {...props}>
          <p>
            <strong>NewMode</strong>
          </p>
          <p>
            This is a placeholder for the NewMode component. You can edit the campaign ID in the
            component settings.
          </p>
          <p>
            Campaign ID: <strong>{props.campaignId}</strong>
          </p>
        </div>
      )
    }

    // Creating a separate component because unavailableContent is cloning the element
    // and adding a countryCode prop to the div which causes a React error
    const UnavailableContent = () => (
      <div {...props.attributes} key={props.attributes?.key}>
        <UserActionFormActionUnavailable
          className="mt-16 min-h-min"
          countryCode={countryCode}
          hideTitle
        />
      </div>
    )

    return (
      <GeoGate countryCode={countryCode} unavailableContent={<UnavailableContent />}>
        <NewMode
          {...props.attributes}
          actionName={props.actionName}
          campaignId={props.campaignId}
          key={props.attributes?.key}
        />
      </GeoGate>
    )
  },
  {
    name: 'NewMode',
    noWrap: true,
    inputs: [
      {
        name: 'campaignId',
        type: 'string',
        required: true,
        helperText: 'The ID of the NewMode campaign to embed.',
      },
      {
        name: 'actionName',
        type: 'string',
        advanced: true,
        required: true,
        helperText: 'The name of the user action to perform.',
        defaultValue: 'DEFAULT',
      },
    ],
  },
)
