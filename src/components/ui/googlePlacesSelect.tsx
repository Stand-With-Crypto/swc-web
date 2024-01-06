import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { useScript } from '@/hooks/useScript'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { useEffect } from 'react'
import usePlacesAutocomplete from 'use-places-autocomplete'

const CALLBACK_NAME = 'PLACES_AUTOCOMPLETE'

const NEXT_PUBLIC_GOOGLE_PLACES_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY',
)

export function PlacesAutocomplete(
  props: {
    value: google.maps.places.AutocompletePrediction
    onChange: (val: google.maps.places.AutocompletePrediction | null) => void
  } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>,
) {
  const { value: propsValue, onChange: propsOnChange, ...inputProps } = props
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    init,
  } = usePlacesAutocomplete({ callbackName: CALLBACK_NAME })

  const scriptStatus = useScript(
    `https://maps.googleapis.com/maps/api/js?key=${NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&callback=${CALLBACK_NAME}`,
  )

  useEffect(() => {
    if (scriptStatus === 'ready') {
      init()
    }
  }, [scriptStatus])
  console.log({ scriptStatus, ready, value, data })
  return (
    <Combobox
      inputValue={value}
      onChangeInputValue={setValue}
      value={props.value}
      onChange={props.onChange}
      formatPopoverTrigger={val => (
        <Input value={val?.description || ''} placeholder="select a location" />
      )}
      options={data}
      getOptionLabel={val => val.description}
      getOptionKey={val => val.place_id}
      popoverContentClassName="w-[400px]"
      {...inputProps}
    />
  )
}
