import React, { Key } from 'react'

import { ExternalLink } from '@/components/ui/link'

interface TextNode {
  text: string
  bold?: boolean
}

interface LinkNode {
  type: 'a'
  url: string
  target: string
  children: RichTextNode[]
}

interface ElementNode {
  type: string
  children: RichTextNode[]
}

export type RichTextNode = TextNode | LinkNode | ElementNode

interface RenderJsonProps {
  richText: RichTextNode[]
}

const isTextNode = (node: RichTextNode): node is TextNode => {
  return (node as TextNode).text !== undefined
}

const isLinkNode = (node: RichTextNode): node is LinkNode => {
  return (node as LinkNode).type === 'a'
}

const createElementFromJson = (node: RichTextNode, key: Key): React.ReactNode => {
  if (isTextNode(node)) {
    const content = node.bold ? <b>{node.text}</b> : node.text
    return <React.Fragment key={key}>{content}</React.Fragment>
  }

  if (isLinkNode(node)) {
    const { url, target, children } = node
    return (
      <ExternalLink href={url} key={key} target={target}>
        {children.map((child, index) => createElementFromJson(child, index))}
      </ExternalLink>
    )
  }

  const { type, children } = node as ElementNode

  return React.createElement(
    type,
    { key },
    children.map((child, index) => createElementFromJson(child, index)),
  )
}

export const RenderRichText = ({ richText }: RenderJsonProps) => {
  return <>{richText?.map((item, index) => createElementFromJson(item, index))}</>
}
