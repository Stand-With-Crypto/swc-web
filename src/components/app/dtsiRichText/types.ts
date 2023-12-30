import { PlateId, TElement } from '@udecode/plate-common'
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_H4 } from '@udecode/plate-heading'
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule'
import { ELEMENT_LINK, TLinkElement } from '@udecode/plate-link'
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '@udecode/plate-list'
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph'
import { TText } from '@udecode/slate'

/**
 * Text
 */

export type EmptyText = {
  text: ''
}

export type PlainText = {
  text: string
}

export interface RichText extends TText {
  // , TCommentText
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  //   code?: boolean
  //   kbd?: boolean
  //   subscript?: boolean
  //   backgroundColor?: React.CSSProperties['backgroundColor']
  //   fontFamily?: React.CSSProperties['fontFamily']
  //   color?: React.CSSProperties['color']
  //   fontSize?: React.CSSProperties['fontSize']
  //   fontWeight?: React.CSSProperties['fontWeight']
}

export interface MyLinkElement extends TLinkElement {
  type: typeof ELEMENT_LINK
  children: RichText[]
}

export type MyInlineElement = MyLinkElement
// | MyMentionElement | MyMentionInputElement
export type MyInlineDescendant = RichText | MyInlineElement
export type MyInlineChildren = MyInlineDescendant[]

export interface MyIndentProps {
  indent?: number
}

export interface MyIndentListProps extends MyIndentProps {
  listStart?: number
  listRestart?: number
  listStyleType?: string
}

export interface MyBlockElement extends TElement, MyIndentListProps {
  // , MyLineHeightProps
  id?: PlateId
}

/**
 * Blocks
 */

export interface MyParagraphElement extends MyBlockElement {
  type: typeof ELEMENT_PARAGRAPH
  children: MyInlineChildren
}

export interface MyH1Element extends MyBlockElement {
  type: typeof ELEMENT_H1
  children: MyInlineChildren
}

export interface MyH2Element extends MyBlockElement {
  type: typeof ELEMENT_H2
  children: MyInlineChildren
}

export interface MyH3Element extends MyBlockElement {
  type: typeof ELEMENT_H3
  children: MyInlineChildren
}

export interface MyH4Element extends MyBlockElement {
  type: typeof ELEMENT_H4
  children: MyInlineChildren
}

export interface MyBulletedListElement extends TElement, MyBlockElement {
  type: typeof ELEMENT_UL
  children: MyListItemElement[]
}

export interface MyNumberedListElement extends TElement, MyBlockElement {
  type: typeof ELEMENT_OL
  children: MyListItemElement[]
}

export interface MyListItemElement extends TElement, MyBlockElement {
  type: typeof ELEMENT_LI
  children: Array<{ type: 'lic'; children: MyInlineChildren }>
}

export interface MyHrElement extends MyBlockElement {
  type: typeof ELEMENT_HR
  children: [EmptyText]
}

export type MyNestableBlock = MyParagraphElement

export type MyRootBlock =
  | MyParagraphElement
  | MyH1Element
  | MyH2Element
  | MyH3Element
  | MyH4Element
  | MyBulletedListElement
  | MyNumberedListElement

export type RichTextEditorRootBlock = MyRootBlock

export type MyValue = readonly MyRootBlock[]
export type RichTextEditorValue = MyValue
