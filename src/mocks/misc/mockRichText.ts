import { RichTextEditorValue } from '@/components/app/dtsiRichText/types'

export const MOCK_RICH_TEXT: RichTextEditorValue = [
  {
    children: [{ text: 'h1 text with a ' }, { bold: true, text: 'bold' }, { text: ' item' }],
    type: 'h1',
  },
  { children: [{ text: 'h2' }], type: 'h2' },
  { children: [{ text: 'h3' }], type: 'h3' },
  {
    children: [
      {
        text: 'a paragraph with a ton of text and even more text and even more text and even more text and even more text and even more text and even more text and even more text and even more text and even more text and even more text and even more text and even more text and even more text',
      },
      { italic: true, text: 'italic and ' },
      { italic: true, text: 'underline and a ', underline: true },
      { text: 'link' },
    ],
    type: 'p',
  },
  {
    children: [
      {
        text: 'averylongwordthatgoesonandonandonandonandonandonandonandonandonandonandonandonandonandonandonandonandonandonandonandon',
      },
    ],
    type: 'p',
  },
  { children: [{ text: '' }], type: 'p' },
  {
    children: [
      {
        children: [
          {
            children: [
              { text: 'bullet point with ' },
              { bold: true, text: 'bold' },
              { text: ' item' },
            ],
            type: 'lic',
          },
        ],
        type: 'li',
      },
      { children: [{ children: [{ text: 'another bullet point' }], type: 'lic' }], type: 'li' },
    ],
    type: 'ul',
  },
  { children: [{ text: '' }], type: 'p' },
  {
    children: [
      {
        children: [
          {
            children: [{ text: 'number point with ' }, { italic: true, text: 'italic' }],
            type: 'lic',
          },
        ],
        type: 'li',
      },
    ],
    type: 'ol',
  },
  { children: [{ text: '' }], type: 'p' },
  {
    children: [
      { text: 'a link ' },
      {
        children: [
          { text: 'h' },
          { bold: true, text: 'ttps://digitalchamber.org/statement-on-digital-asset-aml-act/' },
        ],
        type: 'a',
        url: 'https://digitalchamber.org/statement-on-digital-asset-aml-act/',
      },
      { text: '\n' },
    ],
    type: 'p',
  },
]
