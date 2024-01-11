import { isIpfsDataUrl, parseIpfsImageUrl } from '.'

describe('IPFS utils', () => {
  describe('isIpfsDataUrl', () => {
    it('should return false for empty url', () => {
      expect(isIpfsDataUrl('')).toBe(false)
    })

    it('should return false for non-ipfs url', () => {
      expect(isIpfsDataUrl('https://google.com')).toBe(false)
    })

    it('should return true for ipfs url', () => {
      expect(isIpfsDataUrl('ipfs://QmZzQW8DjZ5hBvQGjXkzJ7fZ1R8j2k1Q2h2X1tBZJ9rZoU')).toBe(true)
    })
  })

  describe('parseIpfsImageUrl', () => {
    it('should return the same url if not ipfs', () => {
      expect(parseIpfsImageUrl('https://google.com')).toBe('https://google.com')
    })

    it('should return the same url if ipfs gateway is already present', () => {
      expect(
        parseIpfsImageUrl('https://ipfs.io/ipfs/QmZzQW8DjZ5hBvQGjXkzJ7fZ1R8j2k1Q2h2X1tBZJ9rZoU'),
      ).toBe('https://ipfs.io/ipfs/QmZzQW8DjZ5hBvQGjXkzJ7fZ1R8j2k1Q2h2X1tBZJ9rZoU')
    })

    it('should return the ipfs gateway url if ipfs', () => {
      expect(parseIpfsImageUrl('ipfs://QmZzQW8DjZ5hBvQGjXkzJ7fZ1R8j2k1Q2h2X1tBZJ9rZoU')).toBe(
        'https://ipfs.io/ipfs/QmZzQW8DjZ5hBvQGjXkzJ7fZ1R8j2k1Q2h2X1tBZJ9rZoU',
      )
    })
  })
})
