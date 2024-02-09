import { Combobox } from '@/components/ui/combobox'
import { InputWithIcons } from '@/components/ui/inputWithIcons'
import { useScript } from '@/hooks/useScript'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { cn } from '@/utils/web/cn'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'
import { MapPin } from 'lucide-react'
import React, { useEffect } from 'react'
import usePlacesAutocomplete from 'use-places-autocomplete'

const CALLBACK_NAME = 'PLACES_AUTOCOMPLETE'

const NEXT_PUBLIC_GOOGLE_PLACES_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY',
)

type Props = {
  value: GooglePlaceAutocompletePrediction | null
  onChange: (val: GooglePlaceAutocompletePrediction | null) => void
  defaultValue?: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>

export const GooglePlacesSelect = React.forwardRef<React.ElementRef<'input'>, Props>(
  (props, ref) => {
    const { value: propsValue, onChange: propsOnChange, defaultValue, ...inputProps } = props
    const {
      ready,
      value,
      suggestions: { data },
      setValue,
      init,
    } = usePlacesAutocomplete({ callbackName: CALLBACK_NAME })

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
            className={cn('', val || 'text-gray-500')}
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
