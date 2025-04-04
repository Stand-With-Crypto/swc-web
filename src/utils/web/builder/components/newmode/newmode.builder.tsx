import { Builder } from '@builder.io/react'

import { NewMode, NewModeProps } from '@/utils/web/builder/components/newmode'
import { BuilderComponentBaseProps } from '@/utils/web/builder/types'

Builder.registerComponent(
  (props: BuilderComponentBaseProps & NewModeProps) => {
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

    return (
      <NewMode {...props.attributes} campaignId={props.campaignId} key={props.attributes?.key} />
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
    ],
  },
)
