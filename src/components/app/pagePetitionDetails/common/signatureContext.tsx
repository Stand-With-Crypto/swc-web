'use client'

import React, { createContext, useContext, useState } from 'react'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { useIsPetitionSigned } from '@/hooks/useIsPetitionSigned'

interface SignatureContextType {
  // Optimistic signature state
  isOptimisticSigned: boolean
  // Actual signature state from user profile
  isPetitionSigned: boolean
  // Combined state
  isSigned: boolean
  petitionSlug: string
  isLoading: boolean
  setIsOptimisticSigned: (signed: boolean) => void
  optimisticSignatureCount: number
  petitionUserAction: SensitiveDataClientUserAction | null
}

const SignatureContext = createContext<SignatureContextType | undefined>(undefined)

interface SignatureProviderProps {
  children: React.ReactNode
  petitionSlug: string
  actualSignatureCount: number
}

export function SignatureProvider({
  children,
  petitionSlug,
  actualSignatureCount,
}: SignatureProviderProps) {
  const [isOptimisticSigned, setIsOptimisticSigned] = useState(false)
  const { isPetitionSigned, isLoading, petitionUserAction } = useIsPetitionSigned(petitionSlug)

  const isSigned = !!isPetitionSigned || isOptimisticSigned
  const optimisticSignatureCount = isSigned ? actualSignatureCount + 1 : actualSignatureCount

  return (
    <SignatureContext.Provider
      value={{
        petitionSlug,
        isPetitionSigned: !!isPetitionSigned,
        petitionUserAction: petitionUserAction ?? null,
        isLoading,
        isOptimisticSigned,
        setIsOptimisticSigned,
        isSigned,
        optimisticSignatureCount,
      }}
    >
      {children}
    </SignatureContext.Provider>
  )
}

export function useSignature() {
  const context = useContext(SignatureContext)
  if (context === undefined) {
    throw new Error('useSignature must be used within a SignatureProvider')
  }
  return context
}
