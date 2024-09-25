export function slugify(text: string): string | undefined {
  if (!text) return

  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
}
