export function createTweetLink({ url, message }: { message: string; url?: string }) {
  if (!url) return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`

  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    url,
  )}&text=${encodeURIComponent(message)}`
}
