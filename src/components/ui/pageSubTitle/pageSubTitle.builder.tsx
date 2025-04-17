import { Children, cloneElement, ReactElement } from 'react'
import { Builder, withChildren } from '@builder.io/react'
import { merge } from 'lodash-es'

import {
  AsVariantsConfig,
  PageSubTitle,
  subTitleVariantsConfig,
} from '@/components/ui/pageSubTitle'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

interface BuilderPageSubtitleProps extends BuilderComponentBaseProps {
  as: (typeof AsVariantsConfig)[number]
  size: keyof typeof subTitleVariantsConfig.size
  withoutBalancer?: boolean
}

Builder.registerComponent(
  withChildren((props: BuilderPageSubtitleProps) => {
    const childrenWithProps = Children.map(props.children, child => {
      const element = child as ReactElement<any>

      return cloneElement(
        element,
        merge({}, element.props, {
          block: {
            component: {
              options: {
                // 1. This is necessary because the text component uses tailwind prose classes
                // and overrides the font size and line height so the size prop is not respected
                // 2. Using style because tailwind doesn't have a way to inherit the font size and line height
                style: {
                  fontSize: 'inherit',
                  lineHeight: 'inherit',
                },
              },
            },
          },
        }),
      )
    })

    return (
      <PageSubTitle
        {...props.attributes}
        as={props.as}
        key={props.attributes?.key}
        size={props.size}
        withoutBalancer={props.withoutBalancer}
      >
        {childrenWithProps}
      </PageSubTitle>
    )
  }),
  {
    name: 'PageSubTitle',
    canHaveChildren: true,
    friendlyName: 'Page Subtitle',
    noWrap: true,
    inputs: [
      {
        name: 'size',
        type: 'enum',
        defaultValue: 'md',
        enum: Object.keys(subTitleVariantsConfig.size),
      },
      {
        name: 'as',
        type: 'enum',
        defaultValue: 'h2',
        helperText: 'The HTML tag to use for the subtitle',
        enum: AsVariantsConfig,
        advanced: true,
      },
      {
        name: 'withoutBalancer',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Whether to disable the balancer for the subtitle',
        advanced: true,
      },
    ],
    childRequirements: {
      message: 'Add a Text or Date component',
      query: {
        'component.name': { $in: ['Text', 'Date'] },
      },
    },
    defaultChildren: [
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Text',
          options: {
            text: 'Enter some text...',
          },
        },
      },
    ],
  },
)
