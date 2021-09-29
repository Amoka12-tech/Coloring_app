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
import RNSlider from "@react-native-community/slider";

export default function EraseModal({ refs }) {
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
    const erasingModal = brushOptions.erasingModal;

    const setIsDrawing = (value) => {
        dispatch({type: "SET_DRAWING", payload: value});
    };

    const setDrawingModal = (value) => {
        dispatch({type: "SET_DRAWING_MODAL", payload: value});
    };

    const setErasingModal = (value) => {
        dispatch({type: "SET_ERASING_MODAL", payload: value});
    };

  return (
    <>
        <Modal
        isOpen={erasingModal}
        overlayVisible={false}
        onClose={() => setErasingModal(false)}
        style={{ justifyContent: "center" }}
      >
        <View
          style={{
            borderRadius: 15,
            backgroundColor: "#4d4d4d",
            width: wp(90),
            height: hp(15),
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
          <HStack justifyContent="space-between" w={wp(80)}>
            <Box w={7} />
            <Text
              fontSize="xl"
              fontWeight={600}
              color="#fff"
              style={{ marginVertical: hp(2) }}
            >
              Eraser
            </Text>
            <TouchableOpacity
              style={{ marginVertical: hp(2) }}
              onPress={() => setErasingModal(false)}
            >
              <Icon color="white" as={<AntDesign name="check" />} size="sm" />
            </TouchableOpacity>
          </HStack>

          <Box
            flex={1}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            w={wp(80)}
          >
            <Text fontSize="xl" color="#fff" ml={2}>
              Eraser size
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
                onSlidingComplete={(e) => dispatch({type: "SET_THICKNESS", payload: e})}
                thumbTintColor="#FFF"
              />
            </Box>
            <TouchableOpacity
              onPress={() => setDrawingModal(false)}
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
            </TouchableOpacity>
          </Box>
        </View>
      </Modal>
    </>
  );
}
