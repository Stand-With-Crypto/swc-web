export function isIpfsDataUrl(url: string) {
  if (!url) {
    return false
  }

  try {
    const parsedUrl = new URL(url)
    const { protocol } = parsedUrl
    return protocol === 'ipfs:'
  } catch (e) {
    console.error(e)
    return false
  }
}

export function parseIpfsImageUrl(url: string) {
  if (!isIpfsDataUrl(url)) {
    return url
  }

  return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
}
