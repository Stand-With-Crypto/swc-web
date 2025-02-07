import { createContext, useContext, useState } from 'react'
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

const AccordionEditingContext = createContext<{
  handleAccordionItemClick: (value: string) => void
} | null>(null)

interface AccordionProps extends BuilderComponentBaseProps {
  collapsible: boolean
  type: 'single' | 'multiple'
}

Builder.registerComponent(
  withChildren((props: AccordionProps) => {
    const [mockedOpenedItems, setMockedOpenedItems] = useState<string[]>([])
    const [mockedSingleOpenItem, setMockedSingleOpenItem] = useState<string>()

    const handleAccordionItemClick = (value: string) => {
      if (props.type === 'single') {
        if (mockedSingleOpenItem === value && props.collapsible) {
          setMockedSingleOpenItem(undefined)
          return
        }

        setMockedSingleOpenItem(value)
        return
      }

      setMockedOpenedItems(prevItems =>
        prevItems.includes(value)
          ? prevItems.filter(item => item !== value)
          : [...prevItems, value],
      )
    }

    const defaultValue = props.builderBlock?.children
      .filter(child => (child.component.options as AccordionItemProps)?.defaultOpen)
      .map(child => (child.component.options as AccordionItemProps)?.title)

    return (
      <AccordionEditingContext.Provider
        value={Builder.isEditing ? { handleAccordionItemClick } : null}
      >
        {props.type === 'single' ? (
          <Accordion
            {...props.attributes}
            collapsible={props.collapsible}
            defaultValue={defaultValue?.[0]}
            key={props.attributes?.key}
            type="single"
            value={Builder.isEditing ? mockedSingleOpenItem : undefined}
          >
            {props.children}
          </Accordion>
        ) : (
          <Accordion
            {...props.attributes}
            defaultValue={defaultValue}
            key={props.attributes?.key}
            type="multiple"
            value={Builder.isEditing ? Array.from(mockedOpenedItems) : undefined}
          >
            {props.children}
          </Accordion>
        )}
      </AccordionEditingContext.Provider>
    )
  }),
  {
    name: ACCORDION_NAME,
    canHaveChildren: true,
    noWrap: true,
    childRequirements: {
      message: `This component only accepts ${ACCORDION_ITEM_NAME} as children`,
      query: {
        'component.name': { $eq: ACCORDION_ITEM_NAME },
      },
    },
    defaultStyles: {
      marginTop: '0px',
    },
    inputs: [
      {
        name: 'type',
        type: 'enum',
        required: true,
        defaultValue: 'single',
        enum: ['single', 'multiple'],
        helperText: 'Whether the accordion opens one or multiple items at a time',
      },
      {
        name: 'collapsible',
        type: 'boolean',
        showIf: options => options.get('type') === 'single',
        defaultValue: true,
        helperText: 'Whether an accordion item can be collapsed after it has been opened',
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
  defaultOpen?: boolean
}

Builder.registerComponent(
  (props: AccordionItemProps) => {
    const { handleAccordionItemClick } = useContext(AccordionEditingContext) ?? {}

    return (
      <AccordionItem
        {...props.attributes}
        key={props.attributes?.key}
        onClick={() => handleAccordionItemClick?.(props.title)}
        value={props.title}
      >
        <AccordionTrigger key={`trigger-${props.attributes?.key ?? ''}`}>
          {props.titleBold ? (
            <strong className="text-foreground">{props.title}</strong>
          ) : (
            props.title
          )}
        </AccordionTrigger>
        <AccordionContent key={`content-${props.attributes?.key ?? ''}`}>
          <div
            className="prose prose-sm max-w-none px-4 pb-2 text-muted-foreground"
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
        </AccordionContent>
      </AccordionItem>
    )
  },
  {
    name: ACCORDION_ITEM_NAME,
    requiresParent: {
      message: `Accordion item must be inside a ${ACCORDION_NAME} component`,
      component: ACCORDION_NAME,
    },
    canHaveChildren: false,
    noWrap: true,
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
        name: 'defaultOpen',
        helperText:
          'Whether the accordion item should be open by default when the page loads. **If the accordion is single, only the first item with this option will be open**',
        type: 'boolean',
        defaultValue: false,
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
      },
    ],
  },
)
