import React, { useState, useRef, useEffect } from 'react';
import { View, PanResponder, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Slider(props) {
  const minValue = props.minValue || 0;
  const maxValue = props.maxValue || 100;
  const minBoundary = 0;
  const maxBoundary = 100;
  const initVal = props.initVal || props.maxValue / 2 || 50;

  const pan = useRef(new Animated.ValueXY()).current;
  const [forceRender, setForceRender] = useState(0);
  const animState = useRef({
    displayMinVal: 0,
    sliderWidth: 0,
    stepWidth: 0,
    minBoundary: 0,
    maxBoundary: 0,
    minBoundaryPosition: 0,
    maxBoundaryPosition: 0,
    offSet: 0,
    clampOffSet: 0,
    initOffSet: 0,
  }).current;

  const [sliderCenter, setSliderCenter] = useState(0);
  const [initOffset, setInitOffset] = useState(0);
  const [minBoundaryPosition, setMinBoundaryPosition] = useState(0);
  const [maxBoundaryPosition, setMaxBoundaryPosition] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const clamp = Math.max(
          animState.minBoundaryPosition,
          Math.min(animState.maxBoundaryPosition, pan.x._value)
        );
        animState.clampOffSet = animState.clampOffSet + pan.x._value - clamp;
        pan.setOffset({ x: clamp, y: 0 });
      },
      onPanResponderMove: (e, gesture) => {
        moveSlider();
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(e, {
          dx: gesture.dx,
          dy: 0,
        });
      },
      onPanResponderRelease: () => {
        animState.offSet = animState.offSet + pan.x._value;
        pan.flattenOffset();
        props.onValueChangeEnd(
          Math.round(
            (animState.displayMinVal / 100) * (maxValue - minValue) + minValue
          )
        );
      },
    })
  ).current;

  useEffect(() => {
    const height = props.height || 40;
    const width = props.width || 400;
    const sWidth = width - height;
    animState.sliderHeight = height;
    animState.sliderWidth = sWidth;
    const stepWidth = sWidth / (maxBoundary - minBoundary);
    animState.stepWidth = stepWidth;
    animState.minBoundary = minBoundary;
    animState.maxBoundary = maxBoundary;

    const center = sWidth / 2;
    setSliderCenter(center);

    const initOff = (initVal - (maxBoundary - minBoundary) / 2) * stepWidth;
    setInitOffset(initOff);

    animState.initOffSet = initOff;
    animState.minBoundaryPosition = -sWidth / 2 - initOff + 4;
    animState.maxBoundaryPosition = sWidth / 2 - initOff + 4;
    setMinBoundaryPosition(-sWidth / 2 - initOff + 4);
    setMaxBoundaryPosition(sWidth / 2 - initOff + 4);

    moveSlider();
  }, []);

  const moveSlider = () => {
    const newVal =
      pan.x._value +
      animState.offSet +
      animState.initOffSet -
      animState.clampOffSet;
    setForceRender(newVal);

    let filterVal = Math.trunc(
      (newVal + animState.sliderWidth / 2 + animState.stepWidth / 2) /
      animState.stepWidth
    );
    filterVal = Math.min(maxBoundary, filterVal);
    filterVal = Math.max(minBoundary, filterVal);
    animState.displayMinVal = filterVal;
  };

  return (
    <View
      style={{
        height: props.height || 40,
        width: props.width || 400,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        start={props.verticalGradient ? undefined : { x: 0, y: 0 }}
        end={props.verticalGradient ? undefined : { x: 1, y: 0 }}
        colors={props.colorArr || ['#E4CBF5', '#AC39FF']}
        style={{
          borderRadius: props.borderRadius || props.height / 2 || 20,
          height: props.height || 40,
          width: props.width || 400,
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          overflow: 'visible',
          left: sliderCenter + initOffset,
          height: props.thumbSize || props.height * 0.8 || 32,
          width: props.thumbSize || props.height * 0.8 || 32,
          backgroundColor: props.thumbBackgroundColor || 'transparent',
          borderRadius: props.thumbBorderRadius || 9999,
          borderWidth: props.thumbBorderWidth || 2,
          borderColor: props.thumbBorderColor || 'white',
          transform: [
            {
              translateX: pan.x.interpolate({
                inputRange: [
                  Math.min(minBoundaryPosition, maxBoundaryPosition),
                  Math.max(minBoundaryPosition, maxBoundaryPosition),
                ],
                outputRange: [
                  Math.min(minBoundaryPosition, maxBoundaryPosition),
                  Math.max(minBoundaryPosition, maxBoundaryPosition),
                ],
                extrapolate: 'clamp',
              }),
            },
          ],
        }}
        {...panResponder.panHandlers}
      />
    </View>
  );
}
