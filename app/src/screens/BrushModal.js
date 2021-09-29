import { Box, HStack, Icon, Modal, FlatList, Text } from 'native-base';
import React, { useRef, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
  } from "react-native-responsive-screen";
import {
    AntDesign,
    Entypo,
    FontAwesome5,
    Foundation,
    MaterialIcons,
  } from "@expo/vector-icons";
import { brushes } from '../../Theme';
import { useDispatch, useSelector } from 'react-redux';
import Slider from "../components/Slider";
import { HSLToRGB } from "../apis/hslToRgb";
import Svg, { Path } from "react-native-svg";

export default function BrushModal({ refs }) {
    const dispatch = useDispatch();
    const brushOptions = useSelector(state => state.imageSettings);
    const minBrushSize = 2.5;
    const maxBrushSize = 27

    //Variables
    const roundOpt = Math.round (brushOptions.opacity * 10) / 10;
    const isDrawing = brushOptions.isDrawing;
    const buttonSize = useRef(wp(12)).current;
    const hue = brushOptions?.hue;
    const saturation = brushOptions?.saturation;
    const lightness = brushOptions?.lightness;
    const opacity = brushOptions?.opacity;
    const thickness = brushOptions?.thickness;

    //Modal Variable
    const drawingModal = brushOptions.drawingModal;


    const setIsDrawing = (value) => {
        dispatch({type: "SET_DRAWING", payload: value});
    };

    const setDrawingModal = (value) => {
        dispatch({type: "SET_DRAWING_MODAL", payload: value});
    };

    const setErasingModal = (value) => {
        dispatch({type: "SET_ERASING_MODAL", payload: value});
    };


    const OpacityBtn = (props) => {
        return(
          <TouchableOpacity 
            onPress={() => {
                const opacityData = props.value/100;
                dispatch({type: 'SET_OPACITY', payload: opacityData});
            }}
            style={{ 
              width: 40,
              height: 40,
              borderRadius: 20,
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: "#fff",
              alignItems: 'center',
              marginLeft: 10,
              elevation: 2,
             }}
            >
            <Text fontSize={10} >{`${props.value}%`}</Text>
          </TouchableOpacity>
        )
      };
    
      const SizeBtn = (props) => {
        return(
          <TouchableOpacity 
            onPress={() => {
                const thicknessData = (props.value * 27)/100;
                dispatch({type: "SET_THICKNESS", payload: thicknessData});
            }}
            style={{ 
              width: 40,
              height: 40,
              borderRadius: 20,
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: "#fff",
              alignItems: 'center',
              marginLeft: 10,
              elevation: 2,
             }}
            >
            <Text fontSize={10} >{`${props.value}%`}</Text>
          </TouchableOpacity>
        )
      };

  return (
    <>
        <Modal
        isOpen={drawingModal}
        overlayVisible={false}
        onClose={() => setDrawingModal(false)}
        style={{ justifyContent: "flex-start", marginTop: hp(6) }}
      >
        <View
          style={{
            borderRadius: 15,
            backgroundColor: "#4d4d4d",
            width: wp(90),
            height: hp(65),
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          >
          <HStack alignItems="center" w={wp(80)} justifyContent="space-between">
            <Box w={7} />
            <Text
              fontSize="xl"
              fontWeight={600}
              color="#fff"
              style={{ marginVertical: hp(2) }}
            >
              Brushes
            </Text>
            <TouchableOpacity
              style={{ marginVertical: hp(2) }}
              onPress={() => setDrawingModal(false)}
            >
              <Icon color="white" as={<AntDesign name="check" />} size="sm" />
            </TouchableOpacity>
          </HStack>
          <View style={{ height: hp(45) }}>
            <FlatList
              data={brushes}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => `${item}-${index}`}
              ItemSeparatorComponent={() => (
                <View
                  style={{ width: wp(90), height: 1, backgroundColor: "#eee" }}
                />
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setDrawingModal(false)}
                  style={{
                    width: wp(90),
                    height: hp(8),
                    backgroundColor: "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: wp(70),
                    }}
                  >
                    <Text>{item.name}</Text>
                    {item.svg}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
          <Box 
            flex={1}
            flexDirection="column"
            w={wp(80)}
          >
            <Box 
              w={wp(80)}
              flexDirection="row"
              alignItems="center"
              >
              <Text color="#fff" fontSize="sm">Opacity: </Text>
              <Box w={wp(50)} flexDirection="row" justifyContent="space-between">
                <OpacityBtn value={10} />
                <OpacityBtn value={50} />
                <OpacityBtn value={100} />
              </Box>
            </Box>
            <Box
              w={wp(80)}
              flexDirection="row"
              alignItems="center"
              marginTop={2}
              >
              <Text color="#fff" fontSize="sm">
                Size: 
              </Text>
              <Box w={wp(50)} marginLeft={10} flexDirection="row" justifyContent="space-between">
                <SizeBtn value={10} />
                <SizeBtn value={50} />
                <SizeBtn value={100} />
              </Box>
            </Box>
          </Box>
          {/* <Box
            flex={1}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            w={wp(80)}
            >
            <Text fontSize="sm" color="#fff" ml={2}>
              Size
            </Text>

            <Text style={{ marginLeft: 10 }} fontSize="sm" color="#fff" >
              0%
            </Text>
            <Box w={wp(50)}>
              <RNSlider
                minimumValue={minBrushSize}
                maximumValue={maxBrushSize}
                minimumTrackTintColor="#FFF"
                maximumTrackTintColor="#000"
                value={thickness}
                step={0.1}
                tapToSeek
                onSlidingComplete={setThickness}
                thumbTintColor="#FFF"
              />
            </Box>
            
            <Text fontSize="sm" color="#fff" >
              100%
            </Text>
            
            <View
              style={{
                width: maxBrushSize,
                height: maxBrushSize,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: thickness + 8,
                  height: thickness + 8,
                  borderRadius: (thickness + 8) / 2,
                  borderColor: "#fff",
                  borderWidth: 1,
                }}
              />
            </View>
          </Box> */}
          {/* <Box
            flex={1}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            w={wp(80)}
            >
            <Text fontSize="sm" color="#fff" ml={2}>
              Opacity
            </Text>
            <Text style={{ marginLeft: 10 }} fontSize="sm" color="#fff" >
              0%
            </Text>
            <Box w={wp(40)}>
              <RNSlider
                minimumValue={0}
                maximumValue={100}
                minimumTrackTintColor="#FFF"
                maximumTrackTintColor="#000"
                value={opacityOpt*100}
                step={0.1}
                tapToSeek
                onSlidingComplete={(value) => setOpacityOpt(value/100)}
                thumbTintColor="#FFF"
              />
            </Box>

            <Text fontSize="sm" color="#fff">
              100%
            </Text>

            
            <View
              style={{
                width: maxBrushSize,
                height: maxBrushSize,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: thickness + 8,
                  height: thickness + 8,
                  borderRadius: (thickness + 8) / 2,
                  borderColor: "#fff",
                  borderWidth: 1,
                }}
              />
            </View>
          </Box> */}
        </View>
        <Svg
          style={{ alignSelf: "flex-end", end: wp(11) - 14.5, top: -10 }}
          width={29}
          height={25}
          xmlns="http://www.w3.org/2000/svg"
        >
          <Path d="M29 0L14.5 25 0 0h29z" fill="#4d4d4d" />
        </Svg>
      </Modal>
    </>
  );
}
