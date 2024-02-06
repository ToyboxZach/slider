import React from 'react'
import * as RN from 'react-native'
import useRange from './hooks/useRange'
import Track from './components/Track'
import Thumb from './components/Thumb'
import ResponderView from './components/ResponderView'
import useDrag from './hooks/useDrag'
import useCustomMarks from './hooks/useCustomMarks'

export type SliderProps = RN.ViewProps & {
  range?: [number, number];
  minimumValue?: number;
  maximumValue?: number;
  minimumRange?: number;
  step?: number;
  outboundColor?: RN.ColorValue;
  inboundColor?: RN.ColorValue;
  thumbTintColor?: RN.ColorValue;
  thumbStyle?: RN.StyleProp<RN.ViewStyle>;
  trackStyle?: RN.StyleProp<RN.ViewStyle>;
  minTrackStyle?: RN.StyleProp<RN.ViewStyle>;
  midTrackStyle?: RN.StyleProp<RN.ViewStyle>;
  maxTrackStyle?: RN.StyleProp<RN.ViewStyle>;
  style?: RN.StyleProp<RN.ViewStyle>;
  inverted?: boolean;
  vertical?: boolean;
  enabled?: boolean;
  slideOnTap?: boolean;
  trackHeight?: number;
  thumbSize?: number;
  thumbImage?: RN.ImageURISource;
  crossingAllowed?: boolean;
  padding?: number;
  onValueChange?: (range: [number, number]) => void;
  onSlidingStart?: (range: [number, number]) => void;
  onSlidingComplete?: (range: [number, number]) => void;
  CustomThumb?: React.ComponentType<{ value: number; thumb: 'min' | 'max' }>;
  CustomMark?: React.ComponentType<{ value: number; active: boolean }>;
};

// We add a default padding to ensure that the responder view has enough space to recognize the touches
const styleSheet = RN.StyleSheet.create({
  vertical: {
    paddingHorizontal: 10
  },
  horizontal: {
    paddingVertical: 10
  }
})

const Slider = React.forwardRef<RN.View, SliderProps>((props: SliderProps, forwardedRef) => {
  const defaultValue = React.useMemo<[number, number]>(
    () => [props.minimumValue || 0, props.minimumValue || 0],
    [props.minimumValue]
  )
  const {
    minimumValue = 0,
    maximumValue = 1,
    range: propValue = defaultValue,
    step = 0,
    outboundColor = 'grey',
    inboundColor = 'blue',
    thumbTintColor = 'darkcyan',
    thumbStyle,
    trackStyle,
    minTrackStyle,
    midTrackStyle,
    maxTrackStyle,
    inverted = false,
    vertical = false,
    enabled = true,
    slideOnTap = true,
    trackHeight = 4,
    thumbSize = 15,
    thumbImage,
    minimumRange = step,
    crossingAllowed = false,
    onValueChange,
    onSlidingStart,
    onSlidingComplete,
    CustomThumb,
    CustomMark,
    padding,
    ...others
  } = props

  const { updateClosestValue, updateMaxValue, range, canMove } = useRange({
    minimumRange,
    minimumValue,
    maximumValue,
    range: propValue,
    step,
    slideOnTap,
    crossingAllowed,
    onValueChange
  })

  const { onPress, onMove, onRelease } = useDrag({
    value: range,
    updateValue: updateClosestValue,
    onSlidingComplete,
    onSlidingStart,
    canMove
  })

  const [min, max] = range
  const minTrackPct = React.useMemo(
    () => (min - minimumValue) / (maximumValue - minimumValue || 1),
    [min, minimumValue, maximumValue]
  )
  const maxTrackPct = React.useMemo(
    () => (max - minimumValue) / (maximumValue - minimumValue || 1),
    [max, minimumValue, maximumValue]
  )

  const { minStyle, midStyle, maxStyle } = React.useMemo(
    () => ({
      minStyle: trackStyle && minTrackStyle ? [trackStyle, minTrackStyle] : trackStyle || minTrackStyle,
      midStyle: trackStyle && midTrackStyle ? [trackStyle, midTrackStyle] : trackStyle || midTrackStyle,
      maxStyle: trackStyle && maxTrackStyle ? [trackStyle, maxTrackStyle] : trackStyle || maxTrackStyle
    }),
    [trackStyle, minTrackStyle, midTrackStyle, maxTrackStyle]
  )

  const thumbProps = React.useMemo(
    () => ({
      color: thumbTintColor,
      style: thumbStyle,
      size: thumbSize,
      CustomThumb: CustomThumb as React.ComponentType<{ value: number; thumb?: 'min' | 'max' }>,
      thumbImage
    }),
    [CustomThumb, thumbImage, thumbSize, thumbStyle, thumbTintColor]
  )

  const { marks, onLayoutUpdateMarks } = useCustomMarks(CustomMark, {
    step,
    minimumValue,
    maximumValue,
    activeValues: range,
    inverted,
    vertical
  })

  return (
    <RN.View {...others}>
      <ResponderView
        style={styleSheet[vertical ? 'vertical' : 'horizontal']}
        ref={forwardedRef}
        maximumValue={maximumValue}
        minimumValue={minimumValue}
        step={step}
        value={max}
        updateValue={updateMaxValue}
        onPress={onPress}
        onMove={onMove}
        onRelease={onRelease}
        enabled={enabled}
        vertical={vertical}
        inverted={inverted}
        onLayout={onLayoutUpdateMarks}
        padding={padding}
      >
        <Track
          color={outboundColor}
          style={minStyle}
          length={minTrackPct * 100}
          vertical={vertical}
          thickness={trackHeight}
        />
        <Thumb {...thumbProps} value={min} thumb="min" />
        <Track
          color={inboundColor}
          style={midStyle}
          length={(maxTrackPct - minTrackPct) * 100}
          vertical={vertical}
          thickness={trackHeight}
        />
        <Thumb {...thumbProps} value={max} thumb="max" />
        <Track
          color={outboundColor}
          style={maxStyle}
          length={(1 - maxTrackPct) * 100}
          vertical={vertical}
          thickness={trackHeight}
        />
        {marks}
      </ResponderView>
    </RN.View>
  )
})

Slider.displayName = 'Slider'

export default Slider
