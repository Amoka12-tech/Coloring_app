import { FlatList, HStack, Icon } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AwesomeButton from "@umangmaurya/react-native-really-awesome-button";
import {
    AntDesign,
    Entypo,
    FontAwesome5,
    Foundation,
    MaterialIcons,
  } from "@expo/vector-icons";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
  } from "react-native-responsive-screen";
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../Theme';
import Slider from '../components/Slider';
import { HSLToRGB } from '../apis/hslToRgb'

export default function SignaturePage({ refs }) {
    const brushOptions = useSelector(state => state.imageSettings);
    const dispatch = useDispatch();

    //Variables

    const roundOpt = Math.round (brushOptions.opacity * 10) / 10;
    const isDrawing = brushOptions.isDrawing;
    const buttonSize = useRef(wp(12)).current;
    const [colorArr, setColorArr] = useState([]);
    const hue = brushOptions?.hue;
    const saturation = brushOptions?.saturation;
    const lightness = brushOptions?.lightness;
    const opacity = brushOptions?.opacity;
    const thickness = brushOptions?.thickness;
    const minBrushSize = 2.5;
    const maxBrushSize = 27;
    const nColors = 12;

    const [penColorHSL, setPenColorHSL] = useState('rgba(243, 140, 140, 1)');

    //Functions
    const setIsDrawing = (value) => {
        dispatch({type: "SET_DRAWING", payload: value});
    };

    const setDrawingModal = (value) => {
        dispatch({type: "SET_DRAWING_MODAL", payload: value});
    };

    const setErasingModal = (value) => {
        dispatch({type: "SET_ERASING_MODAL", payload: value});
    };

  useEffect(() => {
    refs.current.changePenColor(
      penColorHSL
    );
    // console.log(penColorHSL);
  }, [hue, saturation, lightness]);

    useEffect(() => {
      refs.current.changePenSize(thickness, thickness);
    }, [thickness]);

    //Use Effects
    useEffect(() => {
        const arr = [];
        for (let i = nColors; i > 0; i--)
          arr.push(`hsl(${i * (360 / nColors)}, ${saturation}%, ${lightness}%)`);
        setColorArr(arr);
      }, [lightness]);

      useEffect(() => {
        const color = HSLToRGB(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        var hex = color.replace('#','');
    
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
    
        var r = parseInt(hex.substring(0,2), 16),
            g = parseInt(hex.substring(2,4), 16),
            b = parseInt(hex.substring(4,6), 16);
    
            setPenColorHSL('rgba('+r+', '+g+', '+b+', '+roundOpt+')');
            refs.current.changePenColor(
              'rgba('+r+', '+g+', '+b+', '+roundOpt+')'
            );
            // console.log("Scale", 'rgba('+r+', '+g+', '+b+', '+roundOpt+')');
      }, [opacity, hue, saturation, lightness]);

      useEffect(() => {
        if (isDrawing) refs.current.draw();
        else refs.current.erase();
      }, [isDrawing]);

  return (
    <>
        <HStack
            width={wp(90)}
            alignItems="center"
            justifyContent="space-between"
            >
            <AwesomeButton
              onPress={() => {
                setIsDrawing(false);
              }}
              width={buttonSize}
              height={buttonSize}
              borderRadius={2000}
              backgroundColor={!isDrawing ? "#72C4BE" : colors.darkGrey}
              backgroundDarker={colors.grey}
              raiseLevel={2}
            >
              <Icon
                as={<FontAwesome5 name="eraser" />}
                size="sm"
                color="white"
              />
            </AwesomeButton>
            <Slider
              width={wp(60)}
              height={buttonSize / 1.5}
              minValue={60}
              maxValue={90}
              initVal={75}
              positionVal={Math.round(((90 - lightness) / 30) * 100) }
              onValueChangeEnd={(value) => {
                const lightnessData = 90 - value + 60;
                dispatch({type: "SET_LIGHTNESS", payload: lightnessData});
              }}
              colorArr={[
                HSLToRGB(`hsl(${hue}, ${saturation}%, 90%)`),
                HSLToRGB(`hsl(${hue}, ${saturation}%, 60%`),
              ]}
            />
            <AwesomeButton
              onPress={() => {
                !isDrawing ? setIsDrawing(true) : setDrawingModal(true);
              }}
              width={buttonSize}
              height={buttonSize}
              borderRadius={2000}
              backgroundColor={isDrawing ? "#72C4BE" : colors.darkGrey}
              backgroundDarker={colors.grey}
              raiseLevel={2}
            >
              <Icon as={<Entypo name="brush" />} size="sm" color="white" />
            </AwesomeButton>
          </HStack>

          {/* Opacity settings */}
          <HStack
            width={wp(90)}
            alignItems="center"
            justifyContent="space-between"
            >
            
            <Text>Opacity</Text>
            
            <Slider
              width={wp(60)}
              height={buttonSize / 1.5}
              minValue={0}
              maxValue={100}
              initVal={opacity*100}
              positionVal={opacity*100}
              onValueChangeEnd={(value) => {
                const opacityData = value/100;
                dispatch({type: 'SET_OPACITY', payload: opacityData});
                // setOpacityOpt(value/100);
              }}
              colorArr={[
                HSLToRGB(`hsl(${hue}, ${saturation}%, 90%)`),
                HSLToRGB(`hsl(${hue}, ${saturation}%, 60%`),
              ]}
            />
          </HStack>

          {/* Opacity own */}

          <HStack
            width={wp(90)}
            alignItems="center"
            justifyContent="space-between"
            >
              <Text>Brush Size</Text>
            <Slider
              width={wp(60)}
              height={buttonSize / 1.5}
              minValue={minBrushSize}
              maxValue={maxBrushSize}
              initVal={thickness}
              positionVal={Math.round((thickness / 27) * 100) }
              onValueChangeEnd={(value) => {
                dispatch({type: "SET_THICKNESS", payload: value});
                // setThickness(value);
              }}
              colorArr={[
                HSLToRGB(`hsl(${hue}, ${saturation}%, 90%)`),
                HSLToRGB(`hsl(${hue}, ${saturation}%, 60%`),
              ]}
            />
            <View />
          </HStack>

          <FlatList
            horizontal
            data={colorArr}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item}-${index}`}
            contentContainerStyle={{
              paddingHorizontal: wp(4),
              height: wp(10),
            }}
            style={{ flexGrow: 0 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  // setHue(item.substr(4, 3).split(",")[0]);
                  const hueData = item.substr(4, 3).split(",")[0];
                  dispatch({type: 'SET_HUE', payload: hueData});
                }}
                style={{
                  marginHorizontal: wp(1),
                  width: wp(10),
                  borderRadius: wp(5),
                  height: wp(10),
                  backgroundColor: item,
                }}
              />
            )}
          />
    </>
  );
}
