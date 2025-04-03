import { Builder } from '@builder.io/react'

import { BuilderComponentAttributes, BuilderComponentBaseProps } from '@/utils/web/builder/types'

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'newmode-embed': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            action: string
            base: string
          },
          HTMLElement
        >
      }
    }
  }
}

interface NewModeProps {
  campaignId: string
}

function NewMode({ campaignId, ...props }: NewModeProps & BuilderComponentAttributes) {
  if (Builder.isEditing) {
    return (
      <div>
        <p>
          <strong>NewMode</strong>
        </p>
        <p>
          This is a placeholder for the NewMode component. You can edit the campaign ID in the
          component settings.
        </p>
        <p>
          Campaign ID: <strong>{campaignId}</strong>
        </p>
      </div>
    )
  }

  return (
    <newmode-embed {...props} action={campaignId} base="https://base.newmode.net"></newmode-embed>
  )
}

Builder.registerComponent(
  (props: BuilderComponentBaseProps & NewModeProps) => {
    return (
      <NewMode key={props.attributes?.key} {...props.attributes} campaignId={props.campaignId} />
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
