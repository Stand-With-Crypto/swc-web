'use client'

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { z } from 'zod'

import { GetDistrictRankResponse } from '@/app/api/public/referrals/[countryCode]/[stateCode]/[districtNumber]/route'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { useGetElectoralZoneFromAddress } from '@/hooks/useGetElectoralZoneFromAddress'
import { useGetElectoralZoneRank } from '@/hooks/useGetElectoralZoneRank'
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript'
import { AdministrativeArea } from '@/utils/server/districtRankings/types'
import { ElectoralZone } from '@/utils/server/swcCivic/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  convertGooglePlaceAutoPredictionToAddressSchema,
  GooglePlaceAutocompletePrediction,
} from '@/utils/web/googlePlaceUtils'
import { zodAddress } from '@/validation/fields/zodAddress'

interface UserAddress {
  description: string
  place_id: string
}

interface UserAddressContextType {
  address: UserAddress | null
  setAddress: (address: UserAddress | null) => void
  countryCode: string
  mutableAddress: GooglePlaceAutocompletePrediction | null | 'loading'
  setMutableAddress: (address: GooglePlaceAutocompletePrediction | null) => void
  isAddressInCountry: boolean
  addressDetails: z.infer<typeof zodAddress> | null
  isLoading: boolean
  electoralZone: ElectoralZone | null
  electoralZoneRanking: GetDistrictRankResponse | null
  administrativeArea: AdministrativeArea | null
  isAddressFromProfile: boolean
}

const UserAddressContext = createContext<UserAddressContextType | undefined>(undefined)

export const UserAddressProvider = ({
  children,
  countryCode,
  filterByAdministrativeArea = false,
}: {
  children: ReactNode
  countryCode: SupportedCountryCodes
  filterByAdministrativeArea?: boolean
}) => {
  const profileResponse = useApiResponseForUserFullProfileInfo()
  const { setAddress: setMutableAddress, address: mutableAddress } = useMutableCurrentUserAddress()
  const { isLoaded: isGoogleMapsLoaded } = useGoogleMapsScript()
  const [addressDetails, setAddressDetails] = useState<z.infer<typeof zodAddress> | null>(null)
  const [isAddressDetailsLoading, setIsAddressDetailsLoading] = useState(false)

  const isAddressLoading =
    profileResponse.isLoading || mutableAddress === 'loading' || !isGoogleMapsLoaded

  const address = useMemo(() => {
    if (isAddressLoading) return null
    if (profileResponse.data?.user?.address) {
      return {
        description: profileResponse.data.user.address.formattedDescription,
        place_id: profileResponse.data.user.address.googlePlaceId,
      }
    }

    if (mutableAddress) return mutableAddress
    return null
  }, [isAddressLoading, mutableAddress, profileResponse.data?.user?.address])

  const isAddressFromProfile = useMemo(() => {
    if (!address) return false
    return address.place_id === profileResponse.data?.user?.address?.googlePlaceId
  }, [address, profileResponse.data?.user?.address?.googlePlaceId])

  const electoralZoneResponse = useGetElectoralZoneFromAddress({
    address: address?.description,
    placeId: address?.place_id,
  })

  const electoralZone = useMemo(() => {
    if (
      !electoralZoneResponse.data ||
      'notFoundReason' in electoralZoneResponse.data ||
      !electoralZoneResponse.data.zoneName
    ) {
      return null
    }

    return electoralZoneResponse.data
  }, [electoralZoneResponse.data])

  const isAddressInCountry = useMemo(() => {
    if (!electoralZone) return false
    return electoralZone.countryCode.toLowerCase() === countryCode.toLowerCase()
  }, [electoralZone, countryCode])

  const administrativeArea = useMemo<AdministrativeArea | null>(() => {
    if (electoralZone?.administrativeArea)
      return electoralZone.administrativeArea as AdministrativeArea

    //when the administrativeArea is null, we use Google Maps as a fallback
    if (!isAddressLoading && addressDetails?.administrativeAreaLevel1) {
      return addressDetails.administrativeAreaLevel1 as AdministrativeArea
    }

    return null
  }, [addressDetails, electoralZone?.administrativeArea, isAddressLoading])

  const electoralZoneRankingResponse = useGetElectoralZoneRank({
    countryCode,
    stateCode: isAddressInCountry ? administrativeArea : null,
    electoralZone: isAddressInCountry ? (electoralZone?.zoneName?.toString() ?? null) : null,
    filteredByState: filterByAdministrativeArea,
  })

  const electoralZoneRanking = electoralZoneRankingResponse.data ?? null

  const loadAddressDetails = useCallback(async () => {
    if (!address || !isGoogleMapsLoaded || !isAddressInCountry) return

    setIsAddressDetailsLoading(true)

    const addressDetailsResponse = await convertGooglePlaceAutoPredictionToAddressSchema(address)
    setAddressDetails(addressDetailsResponse)

    setIsAddressDetailsLoading(false)
  }, [address, isGoogleMapsLoaded, isAddressInCountry])

  useEffect(() => {
    void loadAddressDetails()
  }, [loadAddressDetails])

  const setAddress = useCallback(
    (newAddress: UserAddress | null) => {
      setMutableAddress(newAddress)
    },
    [setMutableAddress],
  )

  const isElectoralZoneLoading =
    electoralZoneRankingResponse.isLoading || electoralZoneResponse.isLoading
  const isLoading = isAddressLoading || isElectoralZoneLoading || isAddressDetailsLoading

  return (
    <UserAddressContext.Provider
      value={{
        address,
        setAddress,
        countryCode,
        mutableAddress,
        setMutableAddress,
        isAddressInCountry,
        addressDetails,
        isLoading,
        electoralZone,
        electoralZoneRanking,
        administrativeArea,
        isAddressFromProfile,
      }}
    >
      {children}
    </UserAddressContext.Provider>
  )
}

export const useUserAddress = () => {
  const context = useContext(UserAddressContext)
  if (context === undefined) {
    throw new Error('useUserAddress must be used within a UserAddressProvider')
  }
  return context
}
