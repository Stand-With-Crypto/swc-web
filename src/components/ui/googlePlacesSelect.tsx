import React, { useEffect } from 'react'
import { MapPin } from 'lucide-react'
import usePlacesAutocomplete from 'use-places-autocomplete'

import { Combobox } from '@/components/ui/combobox'
import { InputWithIcons } from '@/components/ui/inputWithIcons'
import { useScript } from '@/hooks/useScript'
import { isBrowser } from '@/utils/shared/executionEnvironment'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { cn } from '@/utils/web/cn'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'

const CALLBACK_NAME = 'PLACES_AUTOCOMPLETE'

const NEXT_PUBLIC_GOOGLE_PLACES_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY',
)

/*
We don't want to request people share their location but we want the results to be US-centric
Adding a bias towards the center of the US to ensure the top results make sense
*/
const LAT_LONG_FOR_CENTER_OF_US = { lat: 38.363422, lng: -98.764471 }
const WIDTH_OF_US_METERS = 4654223
type Props = {
  value: GooglePlaceAutocompletePrediction | null
  onChange: (val: GooglePlaceAutocompletePrediction | null) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>

export const GooglePlacesSelect = React.forwardRef<React.ElementRef<'input'>, Props>(
  (props, ref) => {
    const { value: propsValue, onChange: propsOnChange, className, ...inputProps } = props
    const {
      ready,
      value,
      suggestions: { data },
      setValue,
      init,
    } = usePlacesAutocomplete({
      callbackName: CALLBACK_NAME,
      // note on why we aren't restricting to just addresses https://stackoverflow.com/a/65206036
      requestOptions: {
        locationBias:
          isBrowser && window.google
            ? new google.maps.Circle({
                center: LAT_LONG_FOR_CENTER_OF_US,
                radius: WIDTH_OF_US_METERS / 2,
              })
            : undefined,
      },
    })
    const scriptStatus = useScript(
      `https://maps.googleapis.com/maps/api/js?key=${NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&callback=${CALLBACK_NAME}`,
    )

    useEffect(() => {
      if (scriptStatus === 'ready') {
        init()
      }
    }, [init, scriptStatus])
    return (
      <Combobox
        analytics={'Google Place Select'}
        formatPopoverTrigger={triggerProps => (
          <InputWithIcons
            className={cn(
              value || 'text-gray-500',
              'cursor-pointer',
              triggerProps.open && 'outline-none ring-2 ring-ring ring-offset-2',
              className,
            )}
            leftIcon={<MapPin className="h-4 w-4 text-gray-500" />}
            placeholder="select a location"
            ref={ref}
            value={triggerProps.value?.description || inputProps.placeholder || 'select a location'}
            {...inputProps}
          />
        )}
        getOptionKey={val => val.place_id}
        getOptionLabel={val => val.description}
        inputValue={value}
        isLoading={!ready}
        onChange={propsOnChange}
        onChangeInputValue={setValue}
        options={data}
        placeholder="Type your address..."
        value={propsValue}
      />
    )
  },
)
GooglePlacesSelect.displayName = 'GooglePlacesSelect'
