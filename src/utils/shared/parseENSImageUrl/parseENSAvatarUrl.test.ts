import { expect } from '@jest/globals'

import { parseENSImageUrl } from '.'

describe('utils/parseENSImageUrl', () => {
  it('should return null for empty url', () => {
    expect(parseENSImageUrl('')).toBeUndefined()
  })

  it('should return the url itself for https urls', () => {
    expect(parseENSImageUrl('https://google.com')).toBe('https://google.com')
  })

  it('should return ipfs gateway url for ipfs urls', () => {
    expect(parseENSImageUrl('ipfs://QmZzQW8DjZ5hBvQGjXkzJ7fZ1R8j2k1Q2h2X1tBZJ9rZoU')).toBe(
      'https://ipfs.io/ipfs/QmZzQW8DjZ5hBvQGjXkzJ7fZ1R8j2k1Q2h2X1tBZJ9rZoU',
    )
  })

  it('should return the url itself for data:image/svg+xml;base64 urls', () => {
    const url = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmci'
    expect(parseENSImageUrl(url)).toBe(url)
  })
})
