'use client'

import { useEffect } from 'react'

import {
  actionCreateUserActionViewKeyRaces,
  CreateActionViewKeyRacesInput,
} from '@/actions/actionCreateUserActionViewKeyRaces'

interface ViewKeyRacesActionRegistererProps {
  input: CreateActionViewKeyRacesInput
}

// This is a component because it's the only client logic that runs on the composed LocationRaces component
export function ViewKeyRacesActionRegisterer({ input }: ViewKeyRacesActionRegistererProps) {
  useEffect(() => {
    if (input) {
      void actionCreateUserActionViewKeyRaces(input)
    }
  }, [input])

  return null
}
