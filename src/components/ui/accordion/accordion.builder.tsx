import React from 'react'
import { Builder, withChildren } from '@builder.io/react'
import sanitizeHtml from 'sanitize-html'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { BuilderComponentBaseProps } from '@/utils/web/builder/types'

const ACCORDION_NAME = 'Accordion'
const ACCORDION_ITEM_NAME = 'Accordion Item'

interface AccordionProps extends BuilderComponentBaseProps {
  collapsible: boolean
  type: 'single' | 'multiple'
}

Builder.registerComponent(
  withChildren((props: AccordionProps) => (
    <Accordion
      {...props.attributes}
      collapsible={props.collapsible}
      key={props.attributes?.key}
      type={props.type}
    >
      {props.children}
    </Accordion>
  )),
  {
    name: ACCORDION_NAME,
    canHaveChildren: true,
    noWrap: true,
    childRequirements: {
      message: `This component only accepts ${ACCORDION_ITEM_NAME} and Text as children`,
      query: {
        'component.name': { $in: [ACCORDION_ITEM_NAME, 'Text'] },
      },
    },
    defaultStyles: {
      marginTop: '0px',
    },
    inputs: [
      {
        name: 'collapsible',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Whether an accordion item can be collapsed after it has been opened',
      },
      {
        name: 'type',
        type: 'enum',
        required: true,
        defaultValue: 'single',
        enum: ['single', 'multiple'],
        helperText: 'Whether the accordion opens one or multiple items at a time',
      },
    ],
    defaultChildren: [
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: ACCORDION_ITEM_NAME,
          options: {
            title: 'Accordion Item',
            content: 'Accordion Item',
          },
        },
      },
    ],
  },
)

interface AccordionItemProps extends BuilderComponentBaseProps {
  title: string
  content: string
  titleBold: boolean
}

Builder.registerComponent(
  withChildren((props: AccordionItemProps) => {
    return (
      <AccordionItem {...props.attributes} key={props.attributes?.key} value={props.title}>
        <AccordionTrigger key={`trigger-${props.attributes?.key ?? ''}`}>
          {props.titleBold ? (
            <strong className="text-foreground">{props.title}</strong>
          ) : (
            props.title
          )}
        </AccordionTrigger>
        <AccordionContent key={`content-${props.attributes?.key ?? ''}`}>
          <div className="prose prose-sm max-w-none px-4 pb-6 text-muted-foreground">
            <span
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(props.content, {
                  allowedAttributes: {
                    '*': ['style', 'class'],
                    a: ['href'],
                  },
                }),
              }}
              key={`content-${props.attributes?.key ?? ''}`}
            />
            {props.children}
          </div>
        </AccordionContent>
      </AccordionItem>
    )
  }),
  {
    name: ACCORDION_ITEM_NAME,
    requiresParent: {
      message: `Accordion item must be inside a ${ACCORDION_NAME} component`,
      component: ACCORDION_NAME,
    },
    canHaveChildren: true,
    noWrap: true,
    childRequirements: {
      message: `This component only accepts ${ACCORDION_NAME} as children`,
      component: ACCORDION_NAME,
    },
    defaultStyles: {
      marginTop: '0px',
    },
    inputs: [
      {
        name: 'title',
        required: true,
        type: 'string',
        helperText: 'The title of the accordion item',
        defaultValue: 'Accordion Item',
      },
      {
        name: 'content',
        required: true,
        type: 'richText',
        helperText: 'The content of the accordion item',
        defaultValue: 'Accordion Item',
      },
      {
        name: 'titleBold',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Whether the title should be bold',
        advanced: true,
      },
    ],
  },
)
