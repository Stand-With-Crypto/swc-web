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
})
