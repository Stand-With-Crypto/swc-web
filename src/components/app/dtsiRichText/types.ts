import { PlateId, TElement } from '@udecode/plate-common'
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_H4 } from '@udecode/plate-heading'
import { ELEMENT_LINK, TLinkElement } from '@udecode/plate-link'
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '@udecode/plate-list'
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph'
import { TText } from '@udecode/slate'

/**
 * Text
 */

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

interface MyLinkElement extends TLinkElement {
  type: typeof ELEMENT_LINK
  children: RichText[]
}

export type MyInlineElement = MyLinkElement
// | MyMentionElement | MyMentionInputElement
export type MyInlineDescendant = RichText | MyInlineElement
type MyInlineChildren = MyInlineDescendant[]

interface MyIndentProps {
  indent?: number
}

interface MyIndentListProps extends MyIndentProps {
  listStart?: number
  listRestart?: number
  listStyleType?: string
}

interface MyBlockElement extends TElement, MyIndentListProps {
  // , MyLineHeightProps
  id?: PlateId
}

/**
 * Blocks
 */

interface MyParagraphElement extends MyBlockElement {
  type: typeof ELEMENT_PARAGRAPH
  children: MyInlineChildren
}

interface MyH1Element extends MyBlockElement {
  type: typeof ELEMENT_H1
  children: MyInlineChildren
}

interface MyH2Element extends MyBlockElement {
  type: typeof ELEMENT_H2
  children: MyInlineChildren
}

interface MyH3Element extends MyBlockElement {
  type: typeof ELEMENT_H3
  children: MyInlineChildren
}

interface MyH4Element extends MyBlockElement {
  type: typeof ELEMENT_H4
  children: MyInlineChildren
}

interface MyBulletedListElement extends TElement, MyBlockElement {
  type: typeof ELEMENT_UL
  children: MyListItemElement[]
}

interface MyNumberedListElement extends TElement, MyBlockElement {
  type: typeof ELEMENT_OL
  children: MyListItemElement[]
}

interface MyListItemElement extends TElement, MyBlockElement {
  type: typeof ELEMENT_LI
  children: Array<{ type: 'lic'; children: MyInlineChildren }>
}

type MyRootBlock =
  | MyParagraphElement
  | MyH1Element
  | MyH2Element
  | MyH3Element
  | MyH4Element
  | MyBulletedListElement
  | MyNumberedListElement

export type RichTextEditorRootBlock = MyRootBlock

export type RichTextEditorValue = readonly MyRootBlock[]
