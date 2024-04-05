export function createWarpcastLink({ url, message }: { message: string; url: string }) {
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(message)}&embeds[]=${encodeURIComponent(url)}`
}
