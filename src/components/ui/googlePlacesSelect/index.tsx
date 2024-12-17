import React, { useEffect } from 'react'
import { cva } from 'class-variance-authority'
import { MapPin } from 'lucide-react'
import usePlacesAutocomplete from 'use-places-autocomplete'

import { Combobox } from '@/components/ui/combobox'
import { InputWithIcons, InputWithIconsProps } from '@/components/ui/inputWithIcons'
import { Spinner } from '@/components/ui/spinner'
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript'
import { cn } from '@/utils/web/cn'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'

export type GooglePlacesSelectProps = {
  value: GooglePlaceAutocompletePrediction | null
  onChange: (val: GooglePlaceAutocompletePrediction | null) => void
  showIcon?: boolean
  loading?: boolean
  disablePreventMobileKeyboardOffset?: boolean
  /**
   * If true, the component will filter out the route type for US addresses. This will prevent
   * vague addresses from being selected in the US.
   */
  shouldLimitUSAddresses?: boolean
} & Omit<InputWithIconsProps, 'value' | 'onChange' | 'type'>

export const GooglePlacesSelect = React.forwardRef<
  React.ElementRef<'input'>,
  GooglePlacesSelectProps
>((props, ref) => {
  const {
    value: propsValue,
    onChange: propsOnChange,
    className,
    showIcon = true,
    loading,
    disablePreventMobileKeyboardOffset,
    shouldLimitUSAddresses,
    disabled,
    ...inputProps
  } = props
  const [open, setOpen] = React.useState(false)
  const {
    ready,
    value,
    suggestions: { data, loading: isLoadingSuggestions },
    setValue,
    init,
  } = usePlacesAutocomplete({
    requestOptions: {
      locationBias: 'IP_BIAS',
      language: 'en',
      types: ['street_address', 'premise', 'postal_code', 'subpremise', 'route'],
    },
    initOnMount: false,
  })
  // For some countries, the route type is required to show addresses options correctly
  // But for US, if we allow users to use an address with the route type,
  // Capitol Canary won't be able to successfully find the related congressperson based on the address provided
  // That's why we need to filter out the route type for US addresses on required action flows
  const placesAutoCompleteResult = shouldLimitUSAddresses
    ? data?.filter(place => !place.description.includes('USA') || !place.types.includes('route'))
    : data

  const { isLoaded } = useGoogleMapsScript()
  const isLoading = loading || isLoadingSuggestions || !ready

  useEffect(() => {
    if (isLoaded) {
      init()
    }
  }, [init, isLoaded])

  return (
    <Combobox
      analytics={'Google Place Select'}
      disablePreventMobileKeyboardOffset={disablePreventMobileKeyboardOffset}
      disabled={disabled}
      formatPopoverTrigger={triggerProps => (
        <InputWithIcons
          className={cn(
            'text-muted-foreground',
            triggerProps.value && 'text-gray-500',
            'cursor-pointer whitespace-normal text-left',
            triggerProps.open && 'outline-none ring-2 ring-ring ring-offset-2',
            className,
          )}
          disabled={disabled}
          leftIcon={
            showIcon ? (
              <MapPin
                className={mapPinVariants({
                  size: inputProps?.variant,
                })}
              />
            ) : undefined
          }
          placeholder="select a location"
          ref={ref}
          rightIcon={isLoadingSuggestions ? <Spinner /> : undefined}
          value={triggerProps.value?.description || inputProps.placeholder || 'select a location'}
          {...inputProps}
          readOnly
        />
      )}
      getOptionKey={val => val.place_id}
      getOptionLabel={val => val.description}
      inputValue={value}
      isLoading={isLoading}
      onChange={propsOnChange}
      onChangeInputValue={setValue}
      open={open}
      options={placesAutoCompleteResult}
      placeholder="Type your address..."
      setOpen={setOpen}
      value={propsValue}
    />
  )
})
GooglePlacesSelect.displayName = 'GooglePlacesSelect'

const mapPinVariants = cva('text-gray-500', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
