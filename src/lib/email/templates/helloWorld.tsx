import * as React from 'react'
import { Button, Html } from '@react-email/components'

export default function Email() {
  return (
    <Html>
      <Button
        href="https://standwithcrypto.org"
        style={{ background: '#000', color: '#fff', padding: '12px 20px' }}
      >
        Click me
      </Button>
    </Html>
  )
}
