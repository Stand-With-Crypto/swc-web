import React, { useEffect } from 'react'
import { MapPin } from 'lucide-react'
import usePlacesAutocomplete from 'use-places-autocomplete'

import { Combobox } from '@/components/ui/combobox'
import { InputWithIcons } from '@/components/ui/inputWithIcons'
import { useScript } from '@/hooks/useScript'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { cn } from '@/utils/web/cn'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'

const CALLBACK_NAME = 'PLACES_AUTOCOMPLETE'

const NEXT_PUBLIC_GOOGLE_PLACES_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY',
)

type Props = {
  value: GooglePlaceAutocompletePrediction | null
  onChange: (val: GooglePlaceAutocompletePrediction | null) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>

export const GooglePlacesSelect = React.forwardRef<React.ElementRef<'input'>, Props>(
  (props, ref) => {
    const { value: propsValue, onChange: propsOnChange, className, ...inputProps } = props
    const [open, setOpen] = React.useState(false)
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
        locationBias: 'IP_BIAS',
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
            // There's a weird bug where, because the input is type="button", on mobile a long address string will overflow the entire page
            // whitespace-normal prevents that bug
            className={cn(
              triggerProps.value || 'text-gray-500',
              'cursor-pointer whitespace-normal',
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
        open={open}
        options={data}
        placeholder="Type your address..."
        setOpen={setOpen}
        value={propsValue}
      />
    )
  },
)
GooglePlacesSelect.displayName = 'GooglePlacesSelect'
