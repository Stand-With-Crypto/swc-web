import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { useScript } from '@/hooks/useScript'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { cn } from '@/utils/web/cn'
import { useEffect } from 'react'
import usePlacesAutocomplete from 'use-places-autocomplete'

const CALLBACK_NAME = 'PLACES_AUTOCOMPLETE'

const NEXT_PUBLIC_GOOGLE_PLACES_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY',
)

type AutocompletePrediction = Pick<
  google.maps.places.AutocompletePrediction,
  'description' | 'place_id'
>

export function PlacesAutocomplete(
  props: {
    value: AutocompletePrediction | null
    onChange: (val: AutocompletePrediction | null) => void
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
  return (
    <Combobox
      isLoading={!ready}
      inputValue={value}
      onChangeInputValue={setValue}
      value={props.value}
      onChange={props.onChange}
      formatPopoverTrigger={val => (
        <Input
          className={cn(val || 'text-gray-500')}
          value={val?.description || 'select a location'}
          placeholder="select a location"
        />
      )}
      options={data}
      getOptionLabel={val => val.description}
      getOptionKey={val => val.place_id}
      popoverContentClassName="w-[400px]"
      {...inputProps}
    />
  )
}
