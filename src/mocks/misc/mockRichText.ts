import { RichTextEditorValue } from '@/components/app/dtsiRichText/types'

export const MOCK_RICH_TEXT: RichTextEditorValue = [
  {
    type: 'h1',
    children: [{ text: 'h1 text with a ' }, { text: 'bold', bold: true }, { text: ' item' }],
  },
  { type: 'h2', children: [{ text: 'h2' }] },
  { type: 'h3', children: [{ text: 'h3' }] },
  {
    type: 'p',
    children: [
      {
        text: 'a paragraph with a ton of text and even more text and even more text and even more text and even more text and even more text and even more text and even more text and even more text and even more text and even more text and even more text and even more text and even more text',
      },
      { text: 'italic and ', italic: true },
      { italic: true, text: 'underline and a ', underline: true },
      { text: 'link' },
    ],
  },
  {
    type: 'p',
    children: [
      {
        text: 'averylongwordthatgoesonandonandonandonandonandonandonandonandonandonandonandonandonandonandonandonandonandonandonandon',
      },
    ],
  },
  { type: 'p', children: [{ text: '' }] },
  {
    type: 'ul',
    children: [
      {
        type: 'li',
        children: [
          {
            type: 'lic',
            children: [
              { text: 'bullet point with ' },
              { text: 'bold', bold: true },
              { text: ' item' },
            ],
          },
        ],
      },
      { type: 'li', children: [{ type: 'lic', children: [{ text: 'another bullet point' }] }] },
    ],
  },
  { type: 'p', children: [{ text: '' }] },
  {
    type: 'ol',
    children: [
      {
        type: 'li',
        children: [
          {
            type: 'lic',
            children: [{ text: 'number point with ' }, { text: 'italic', italic: true }],
          },
        ],
      },
    ],
  },
  { type: 'p', children: [{ text: '' }] },
  {
    type: 'p',
    children: [
      { text: 'a link ' },
      {
        url: 'https://digitalchamber.org/statement-on-digital-asset-aml-act/',
        type: 'a',
        children: [
          { text: 'h' },
          { text: 'ttps://digitalchamber.org/statement-on-digital-asset-aml-act/', bold: true },
        ],
      },
      { text: '\n' },
    ],
  },
]
