export function createTweetLink({ url, message }: { message: string; url: string }) {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    url,
  )}&text=${encodeURIComponent(message)}`
}
