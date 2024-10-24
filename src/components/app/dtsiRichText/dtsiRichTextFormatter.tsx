import React from 'react'
import * as Sentry from '@sentry/nextjs'

import { ExternalLink } from '@/components/ui/link'
import { cn } from '@/utils/web/cn'

import {
  MyInlineDescendant,
  MyInlineElement,
  RichText,
  RichTextEditorRootBlock,
  RichTextEditorValue,
} from './types'

const getRichTextComponent = (node: RichText) => {
  return (
    <span
      className={cn(
        node.italic && 'italic',
        node.underline && 'underline',
        node.bold && 'font-bold',
      )}
    >
      {node.text}
    </span>
  )
}

const isInlineDescendant = (node: MyInlineDescendant): node is MyInlineElement => {
  return 'type' in node && node.type === 'a'
}

const getInlineDescendantComponent = (node: MyInlineDescendant) => {
  if (isInlineDescendant(node)) {
    return (
      <ExternalLink className="underline" href={node.url}>
        {node.children.map((child, index) => (
          <React.Fragment key={index}>{getInlineDescendantComponent(child)}</React.Fragment>
        ))}
      </ExternalLink>
    )
  }
  return getRichTextComponent(node)
}

const getRootBlockComponent = (node: RichTextEditorRootBlock) => {
  if ('type' in node) {
    switch (node.type) {
      case 'h1':
        return (
          <h3 className="pb-2 text-4xl">
            {node.children.map((child, index) => (
              <React.Fragment key={`h1-child-${index}`}>
                {getInlineDescendantComponent(child)}
              </React.Fragment>
            ))}
          </h3>
        )
      case 'h2':
        return (
          <h4 className="pb-2 text-3xl">
            {node.children.map((child, index) => (
              <React.Fragment key={`h2-child-${index}`}>
                {getInlineDescendantComponent(child)}
              </React.Fragment>
            ))}
          </h4>
        )
      case 'h3':
        return (
          <h5 className="pb-2 text-2xl">
            {node.children.map((child, index) => (
              <React.Fragment key={`h3-child-${index}`}>
                {getInlineDescendantComponent(child)}
              </React.Fragment>
            ))}
          </h5>
        )
      case 'h4':
        return (
          <h6 className="pb-2 text-xl">
            {node.children.map((child, index) => (
              <React.Fragment key={`h4-child-${index}`}>
                {getInlineDescendantComponent(child)}
              </React.Fragment>
            ))}
          </h6>
        )
      case 'ul':
        return (
          <ul className="list-disc space-y-3 pb-2 ps-6">
            {node.children.map((child, index) => (
              <React.Fragment key={`ul-child-${index}`}>
                {child.children.map((x, i) => (
                  <li key={`ul-item-${i}`}>
                    {x.children.map((descendant, j) => (
                      <React.Fragment key={`ul-item-descendant-${j}`}>
                        {getInlineDescendantComponent(descendant)}
                      </React.Fragment>
                    ))}
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
        )
      case 'ol':
        return (
          <ol className="list-decimal space-y-3 pb-2 ps-6">
            {node.children.map((child, index) => (
              <React.Fragment key={`ol-child-${index}`}>
                {child.children.map((x, i) => (
                  <li key={`ol-item-${i}`}>
                    {x.children.map((descendant, j) => (
                      <React.Fragment key={`ol-item-descendant-${j}`}>
                        {getInlineDescendantComponent(descendant)}
                      </React.Fragment>
                    ))}
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ol>
        )
      case 'p':
        return (
          <p className="pb-2">
            {node.children.map((child, index) => (
              <React.Fragment key={`p-child-${index}`}>
                {getInlineDescendantComponent(child)}
              </React.Fragment>
            ))}
          </p>
        )
    }
  }
  Sentry.captureMessage('RichTextFormatter: Unknown root block type', { extra: { node } })
  return null
}

export const RichTextFormatter: React.FC<{ richText: unknown | null; className?: string }> = ({
  richText,
  className,
}) => {
  if (!richText) {
    return null
  }
  const value = richText as RichTextEditorValue
  return (
    <div
      className={cn('max-w-full break-words text-left', className)}
      style={{ wordBreak: 'break-word' }}
    >
      {value.map((node, index) => (
        <React.Fragment key={index}>{getRootBlockComponent(node)}</React.Fragment>
      ))}
    </div>
  )
}
