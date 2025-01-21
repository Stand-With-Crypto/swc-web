import sanitizeHtml from 'sanitize-html'

interface RichTextProps {
  content: string
}

export function RichText({ content }: RichTextProps) {
  return (
    <div
      className="prose max-w-full"
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(content, {
          allowedAttributes: {
            '*': ['style', 'class'],
          },
        }),
      }}
    />
  )
}
