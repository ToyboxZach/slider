import React from 'react'
import { useEvent } from './useEvent'
import useRounding from './useRounding'

type Props = {
  step: number;
  value: number;
  minimumValue: number;
  maximumValue: number;
  slideOnTap: boolean | undefined;
  onValueChange?: (value: number) => void;
};

/** Handle the state of a thumb for a slider */
const useThumb = (props: Props) => {
  const { step, value: propValue, slideOnTap, minimumValue, maximumValue, onValueChange } = props
  const [value, setValue] = React.useState(propValue || minimumValue) // The value desired
  const round = useRounding({ step, minimumValue, maximumValue })

  // This block will group close call to setValue into one single update to greatly improve perfs
  const [updated, setUpdated] = React.useState(0)
  const nextValue = React.useRef(value)
  React.useEffect(() => {
    if (updated) {
      setUpdated(0)
      setValue(nextValue.current)
    }
  }, [updated])

  /** Update the thumb value */
  const updateValue = useEvent((newValue: number, fireEvent?: boolean) => {
    const rounded = round(newValue)
    if (rounded !== nextValue.current) {
      nextValue.current = rounded
      setUpdated((updated: number) => updated + 1)
      if (fireEvent) onValueChange?.(nextValue.current)
    }
  })

  // Update the value on bounds change
  React.useEffect(() => {
    updateValue(nextValue.current)
  }, [step, minimumValue, maximumValue, updateValue])

  // Update the value on propchange
  React.useEffect(() => {
    updateValue(propValue)
  }, [propValue, updateValue])

  /** Call onValueChange when the user changed the value */
  const userUpdateValue = useEvent((newValue: number) => {
    updateValue(newValue, true)
  })

  /**
   * Indicates whether we accept to move to the specified position.
   * If the position is too far and slideOnTap is not set, we don't accept sliding there
   **/
  const canMove = useEvent((newValue: number) => {
    if (slideOnTap) return true
    else return Math.abs(newValue - value) / (maximumValue - minimumValue || 1) < 0.1
  })

  return { updateValue: userUpdateValue, canMove, value }
}

export default useThumb
