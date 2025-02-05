import React from 'react'
import { Builder, withChildren } from '@builder.io/react'
import sanitizeHtml from 'sanitize-html'

import { BuilderComponentBaseProps } from '@/utils/web/builder/types'
import { cn } from '@/utils/web/cn'

const LIST_NAME = 'List'
const LIT_ITEM_NAME = 'List Item'

interface ListProps extends BuilderComponentBaseProps {
  type: 'ordered' | 'unordered'
  unorderedMarker: 'disc' | 'circle' | 'square'
  orderedMarker: React.OlHTMLAttributes<HTMLOListElement>['type']
}

Builder.registerComponent(
  withChildren((props: ListProps) => {
    const ListElement = props.type === 'ordered' ? 'ol' : 'ul'

    return (
      <div
        {...props.attributes}
        className={cn('prose max-w-full break-words prose-p:m-0', props.attributes?.className)}
        key={props.attributes?.key}
      >
        <ListElement
          className={cn({
            'list-disc': props.type === 'unordered' && props.unorderedMarker === 'disc',
            'list-[circle]': props.type === 'unordered' && props.unorderedMarker === 'circle',
            'list-[square]': props.type === 'unordered' && props.unorderedMarker === 'square',
          })}
          type={props.type === 'ordered' ? props.orderedMarker : undefined}
        >
          {props.children}
        </ListElement>
      </div>
    )
  }),
  {
    name: LIST_NAME,
    canHaveChildren: true,
    noWrap: true,
    childRequirements: {
      message: `This component only accepts ${LIT_ITEM_NAME} and Text as children`,
      query: {
        'component.name': { $in: [LIT_ITEM_NAME, 'Text'] },
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
        defaultValue: 'unordered',
        enum: ['ordered', 'unordered'],
      },
      {
        name: 'orderedMarker',
        friendlyName: 'Marker',
        type: 'enum',
        defaultValue: '1',
        enum: ['1', 'A', 'a', 'I', 'i'],
        showIf: options => options.get('type') === 'ordered',
      },
      {
        name: 'unorderedMarker',
        friendlyName: 'Marker',
        type: 'enum',
        defaultValue: 'disc',
        enum: ['disc', 'circle', 'square'],
        showIf: options => options.get('type') === 'unordered',
      },
    ],
    defaultChildren: [
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: LIT_ITEM_NAME,
          options: {
            text: 'List Item',
          },
        },
      },
    ],
  },
)

interface ListItemProps extends BuilderComponentBaseProps {
  text: string
}

Builder.registerComponent(
  withChildren((props: ListItemProps) => (
    <li
      {...props.attributes}
      // Adding !list-item here because Builder.io adds a display flex to the list item which breaks the list item marker
      className={cn('!list-item [&>p]:!m-0', props.attributes?.className)}
      key={props.attributes?.key}
    >
      <span
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(props.text, {
            allowedAttributes: {
              '*': ['style', 'class'],
              a: ['href'],
            },
          }),
        }}
        key={'content-' + props.attributes?.key}
      />
      {props.children}
    </li>
  )),
  {
    name: LIT_ITEM_NAME,
    requiresParent: {
      message: `List item must be inside a ${LIST_NAME} component`,
      component: LIST_NAME,
    },
    canHaveChildren: true,
    noWrap: true,
    childRequirements: {
      message: `This component only accepts ${LIST_NAME} as children`,
      component: LIST_NAME,
    },
    defaultStyles: {
      marginTop: '0px',
    },
    inputs: [
      {
        name: 'text',
        required: true,
        type: 'richText',
        defaultValue: 'List Item',
      },
    ],
  },
)
