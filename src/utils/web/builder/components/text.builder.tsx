import { Builder } from '@builder.io/react'

import { StyledHtmlContent } from '@/components/ui/styledHtmlContent'
import { BuilderComponentBaseProps } from '@/utils/web/builder'

interface BuilderTextProps extends BuilderComponentBaseProps {
  text: string
  style?: React.CSSProperties
}

Builder.registerComponent(
  ({ text, attributes, style }: BuilderTextProps) => (
    <StyledHtmlContent
      {...attributes}
      className={attributes?.className}
      html={text}
      style={style}
    />
  ),
  {
    name: 'Text',
    override: true,
    noWrap: true, // Disables the default "Link URL" field
    inputs: [
      {
        name: 'text',
        type: 'richText',
        required: true,
        defaultValue: 'Enter some text...',
      },
    ],
  },
)
