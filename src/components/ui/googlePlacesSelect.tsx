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
  defaultValue?: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>

export const GooglePlacesSelect = React.forwardRef<React.ElementRef<'input'>, Props>(
  (props, ref) => {
    const {
      value: propsValue,
      onChange: propsOnChange,
      className,
      defaultValue,
      ...inputProps
    } = props

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
        if (defaultValue) {
          setValue(defaultValue)
        }
      }
    }, [defaultValue, init, scriptStatus, setValue])
    return (
      <Combobox
        analytics={'Google Place Select'}
        formatPopoverTrigger={val => (
          <InputWithIcons
            className={cn(val || 'text-gray-500', 'cursor-pointer', className)}
            leftIcon={<MapPin className="h-4 w-4 text-gray-500" />}
            placeholder="select a location"
            ref={ref}
            value={
              val?.description
                ? // There's a weird bug where, because the input is type="button", on mobile a long address string will overflow the entire page
                  // this is a hack to prevent that, but ideally we could fix with CSS (all the usual suspects didn't work)
                  val.description.length > 45
                  ? `${val.description.slice(0, 42)}...`
                  : val.description
                : inputProps.placeholder || 'select a location'
            }
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
