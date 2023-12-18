// NOTE: prefer tailwinds truncate class when possible https://tailwindcss.com/docs/text-overflow
export const maybeEllipsisText = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength - 3) + '...'
  }
  return text
}
