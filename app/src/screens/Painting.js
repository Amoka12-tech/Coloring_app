import React, { useEffect, useRef, useState } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import {
  Box,
  Button,
  FlatList,
  HStack,
  Icon,
  Input,
  Modal,
  Text,
  VStack,
} from "native-base";
import { Animated, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import RNSlider from "@react-native-community/slider";
import { StatusBar } from "expo-status-bar";
import {
  AntDesign,
  Entypo,
  FontAwesome5,
  Foundation,
  MaterialIcons,
} from "@expo/vector-icons";
import AwesomeButton from "@umangmaurya/react-native-really-awesome-button";
import { brushes, colors, imgSize } from "../../Theme";
import Slider from "../components/Slider";
import { HSLToRGB } from "../apis/hslToRgb";
import Svg, { Path } from "react-native-svg";
import SignatureScreen from "react-native-signature-canvas";
import * as RootNavigation from "../../RootNavigation";
import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import { checkForHash } from "../apis/hashedUrls";
import { PinchGestureHandler, PanGestureHandler, RotationGestureHandler, State, TextInput } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from "react-redux";
import SignaturePage from "./SignaturePage";
import BrushModal from "./BrushModal";
import EraseModal from "./EraseModal";
import { store } from '../redux/store';

export default function Painting({ navigation, route }) {
  // const brushSettings = useSelector(state => state.imageSettings);
  // console.log(brushSettings?.opacity);
  
  const [colorArr, setColorArr] = useState([]);
  // const hue = brushSettings?.hue;
  // const saturation = brushSettings?.saturation;
  // const lightness = brushSettings?.lightness;
  // const [isDrawing, setIsDrawing] = useState(true);
  const [isZooming, setIsZooming] = useState(false);
  const [drawingModal, setDrawingModal] = useState(false);
  const [erasingModal, setErasingModal] = useState(false);
  const [dataURL, setDataURL] = useState(null);
  const [filesystemURI, setFilesystemURI] = useState(null);
  const [warning, setWarning] = useState(false);
  // const thickness = brushSettings?.thickness;
  // const [opacityOpt, setOpacityOpt] = useState(brushSettings?.opacity);
  const [blur, setBlur] = useState(0);
  const [saveModal, setSaveModal] = useState(false);
  const [drawingName, setDrawingName] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [jsonDrawings, setJsonDrawings] = useState(null);
  const [isPageFocused, setIsPageFocused] = useState(false);
  const saved = useRef(false);

  const nColors = 12;
  const buttonSize = useRef(wp(12)).current;
  const minBrushSize = 2.5;
  const maxBrushSize = 27;

  /* #region  Signature */
  const ref = useRef();
  const expoRef = useRef();
  const dispatch = useDispatch();

  const changeOpacity = (value) => {
    const opacityVal = Math.round (value * 10) /10;
    dispatch({type: "SET_OPACITY", payload: opacityVal});
  };

  const { imageUrl, itemHash} = route.params;

  const [penColorHSL, setPenColorHSL] = useState('');

  // const roundOpt = Math.round (brushSettings.opacity * 10) / 10;

  const loadLocaStorage = async () => {
    const storeDrawings = await AsyncStorage.getItem('@drawings');
    const drawingsParse = storeDrawings != null ? JSON.parse(storeDrawings) : null;
    setJsonDrawings(drawingsParse);
    getImageSettings(drawingsParse);
    console.log("focus");
  };
  

  // useEffect(() => {
  //   return navigation.addListener("blur", () => setIsPageFocused(false));
  // },[]);

  useEffect(() => {
    return navigation.addListener("focus", () => loadLocaStorage());
  }, []);
  const thisItemId = Date.now();
  
  const drawingArray = jsonDrawings;
  // console.log('Code:',thisItemId);
  const imageObj = {
    id: itemHash !== undefined ? itemHash.id : thisItemId,
    imageUrl: imageUrl,
    dataURL: dataURL,
    name: drawingName,
  };

  const getImageSettings = (value) => {
    // console.log(itemHash);
    if(itemHash !== undefined){
      console.log("ID: ",itemHash.id);
      const singleImageDetails = value?.filter(value => value.id === itemHash?.id);
    if(singleImageDetails != undefined && isPageFocused !== true){
      // console.log('Image:',singleImageDetails);
      setDrawingName(singleImageDetails[0].name);
      setDataURL(singleImageDetails[0].dataURL);
      setIsPageFocused(true);
    }
  }
  }


  useEffect(() => {
    return () => {
      updateEditingSet();
      // console.log('here')
    };
  }, [drawingName]);

  const updateEditingSet = () => {
    if(editing){
      // console.log(editing);
      imageObj.name = drawingName;
    }else{
      imageObj.name = drawingName;
    }
  };

  const handleEmpty = () => {
    console.log("Nothing to save");
  };

  const handleOK = async (signature) => {
    // console.log(signature);
    try {
      // await FileSystem.writeAsStringAsync(
      //   filesystemURI,
      //   signature.replace("data:image/png;base64,", ""),
      //   { encoding: FileSystem.EncodingType.Base64 },
      // );
      
      
      // const drawing = await FileSystem.getInfoAsync(filesystemURI);
      // console.log('Name',drawing);
      imageObj.dataURL = signature;
      saved.current = true;

      if(!!drawingArray){
        const isImageDetails = drawingArray.some(value => value.id === imageObj.id);
        // console.log("Details:",isImageDetails);
        if(isImageDetails){
          const oldDrawingArray = drawingArray.filter(value => value.id !== imageObj.id);
          const newDrawingArray = oldDrawingArray.concat(imageObj);
          const jsonPass = JSON.stringify(newDrawingArray);
          await AsyncStorage.setItem('@drawings',jsonPass);
        }else{
          const newDrawingArray = drawingArray.concat(imageObj);
          const jsonPass = JSON.stringify(newDrawingArray);
          await AsyncStorage.setItem('@drawings',jsonPass);
        };
      }else{
        const jsonData = JSON.stringify([imageObj]);
        await AsyncStorage.setItem('@drawings',jsonData);
      }
      // console.log(imageObj.dataURL);
      navigation.goBack();
    } catch (error) {
      console.error(error);
    }
  };

  const gestureState = State.ACTIVE;

  // useEffect(() => {
  //   if (isDrawing) ref.current.draw();
  //   else ref.current.erase();
  // }, [isDrawing]);

  const style = `.m-signature-pad {box-shadow: none; border: none; } 
                 .m-signature-pad--body {border: none;}
                 .m-signature-pad--footer {display: none; margin: 0px;}
                 .button {
                   background-color: red;
                   color: #FFF;
                 }
                 body,html {
                 width: ${imgSize.width}px; height: ${imgSize.height}px;}`;

  const [webStyles, setWebStyles] = useState(style);
  /* #endregion */

  useEffect(() => {
    return navigation.addListener("beforeRemove", (e) => {
      if (saved.current) return;
      //navigation.dispatch(e.data.action)
      e.preventDefault();
      ref.current.getData();
    });
  }, [navigation]);

  const handleData = (data) => {
    saved.current = true;
    if (data.length > 2) setWarning(true);
    else navigation.goBack();
  };

  

  const [moveZoom, setMoveZoom] = useState(false);

  const panRef = React.createRef();
  const pinchRef = React.createRef();
  const rotationRef = React.createRef();


  const baseScale = new Animated.Value(1);
  const pinchScale = new Animated.Value(1);
  const scale = new Animated.multiply(baseScale, pinchScale);
  let lastScale = 1;
  let lastPan = {x: 0, y: 0};
  
  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);

  // console.log('Animation: ',lastS," ",lastX," ",lastY);


  const onGestureEvent = Animated.event([{
    nativeEvent: {scale: pinchScale}
  }],
  {useNativeDriver:true}
  );

  const onPinchStateChange = event => {
    if(event.nativeEvent.oldState === State.ACTIVE){
      lastScale *= event.nativeEvent.scale;
      baseScale.setValue(lastScale);
      pinchScale.setValue(1);
      // console.log(lastScale);
      // setLastS(lastScale);
    }
  };


  const handlePan = Animated.event([{
    nativeEvent: {
      translationX: translateX,
      translationY: translateY,
    },
  }],
    {
      // listener: e => console.log('event:', e.nativeEvent),
      useNativeDriver: true
    }
    );

  const onHandlePanState = (event) => {
    const { numberOfPointers } = event.nativeEvent;
    // console.log("Event: ",numberOfPointers);
    if(numberOfPointers > 1){
      ref.current.erase();
    }else{
      const isDrawing = store.getState().imageSettings.isDrawing;
      if(isDrawing) ref.current.draw();
      else ref.current.erase();
    }
    if(event.nativeEvent.oldState === State.ACTIVE){
      lastPan.x += event.nativeEvent.translationX;
      lastPan.y += event.nativeEvent.translationY;
      translateX.setOffset(lastPan.x);
      translateX.setValue(0);
      translateY.setOffset(lastPan.y);
      translateY.setValue(0);
      // setLastX(lastPan.x);
      // setLastY(lastPan.y);
      // ref.current.erase();
    }
  };

    const _rotate = new Animated.Value(0);
    const _rotateStr = _rotate.interpolate({
      inputRange: [-100, 100],
      outputRange: ['-100rad', '100rad'],
    });

    let _lastRotate = 0;
    const onRotateGestureEvent = Animated.event(
      [{ nativeEvent: { rotation: _rotate } }],
      { useNativeDriver: true }
      );
    
    const onRotateHandlerStateChange = (event) => {
      if(event.nativeEvent.oldState === State.ACTIVE){
        _lastRotate += event.nativeEvent.rotation;
        _rotate.setOffset(_lastRotate);
        _rotate.setValue(0);
      }
    };

  const AppBar = () => {
    return (
      <>
        <Box safeAreaTop zIndex={1000} />

        <HStack zIndex={1000} px={5} justifyContent="space-between" alignItems="center">
          <TouchableOpacity onPress={() => {
            setIsPageFocused(false);
            navigation.goBack();
          }}>
            <Icon
              as={<MaterialIcons name="arrow-back-ios" />}
              size="sm"
              color="black"
            />
          </TouchableOpacity>
          <HStack alignItems="center" justifyContent="space-evenly" w={wp(50)}>
            <TouchableOpacity onPress={() => ref.current.undo()}>
              <Icon
                as={<FontAwesome5 name="undo-alt" />}
                size="sm"
                color="black"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon
                as={<Foundation name="info" />}
                size="xl"
                color={colors.darkGrey}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => ref.current.redo()}>
              <Icon
                as={<FontAwesome5 name="redo-alt" />}
                size="sm"
                color="black"
              />
            </TouchableOpacity>
          </HStack>
          <TouchableOpacity>
            {/* <Icon
              as={<MaterialIcons name="more-vert" />}
              size="sm"
              color="black"
            /> */}
          </TouchableOpacity>
        </HStack>
      </>
    );
  };
  

  return (
    <>
      <StatusBar backgroundColor={warning ? "rgba(0,0,0,0.3)" : undefined} />

      <AppBar />

      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', zIndex: 1 }}>
        <Text style={{ fontSize: 16 }} >
          {drawingName}
        </Text>
      </View>

      <Modal
        isOpen={warning}
        overlayVisible={true}
        onClose={() => setWarning(false)}
        style={{ justifyContent: "center" }}
      >
        <View
          style={{
            width: wp(70),
            height: hp(40),
            backgroundColor: colors.lightGrey,
            borderRadius: 15,
          }}
          >

            <View style={{ 
              width: wp(70), 
              height: hp(10), 
              backgroundColor: '#f43f5e', 
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              justifyContent: 'center',
              alignItems: 'center',
               }}>
              <AntDesign name="warning" size={hp(7)} color={colors.lightGrey} />
            </View>
            <View style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Warning</Text>
              <Text style={{ padding: 10 }}>
                You have unsaved changes, would you like to save them first?
              </Text>

              <View style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexDirection: 'row' }}>
                <TouchableOpacity 
                  onPress={() => navigation.goBack()}
                  style={{ backgroundColor: '#f43f5e', padding: 10 }}>
                  <Text style={{ color: "#fff" }}>Discard</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => {
                    setWarning(false);
                    setSaveModal(true);
                  }}
                  style={{ backgroundColor: colors.green, padding: 10 }}>
                  <Text style={{ color: "#fff" }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          
        </View>
      </Modal>

      {/* Drawing Modal */}
      <BrushModal refs={ref} />

      {/* Erase Modal */}
      {/* <EraseModal refs={ref} /> */}

      <Modal 
       isOpen={saveModal}
       overlayVisible={true}
       style={{ justifyContent: "center" }}
       >
         <View style={{ width: wp(90), flexDirection: 'row', justifyContent: 'space-between' }}>
            <View />
            <TouchableOpacity
              style={{ marginVertical: hp(2) }}
              onPress={() => setSaveModal(false)}
              >
              <Icon color="white" as={<FontAwesome5 name="times" />} size="sm" />
            </TouchableOpacity>
         </View>
         <TextInput 
          style={{ width: wp(60), marginBottom: 10, backgroundColor: '#fff', borderRadius: 5, padding: 10 }}
          value={drawingName}
          onChangeText={(value) => setDrawingName(value)}
          placeholder="Enter Drawing Name"
           />

          <HStack
            width={wp(90)}
            style={{ height: 40 }}
            alignItems="center"
            justifyContent="space-evenly"
            >
            <AwesomeButton
              onPress={() => {
                console.log("Saving...");
                ref.current.readSignature();
              }}
              height={40}
              width={wp(30)}
              borderRadius={2000}
              backgroundColor={colors.green}
              backgroundDarker={colors.lightGrey}
              raiseLevel={2}
              >
              <Text color="#fff" fontSize="xl">
                Save
              </Text>
            </AwesomeButton>
          </HStack>
       </Modal>

      <Box flex={1} alignItems="center">
        {/* <AwesomeButton
              onPress={() => {
                setIsZooming(!isZooming);
              }}
              width={buttonSize}
              height={buttonSize}
              borderRadius={2000}
              backgroundColor={isZooming ? "#72C4BE" : colors.darkGrey}
              backgroundDarker={colors.grey}
              raiseLevel={2}
              style={{ position: 'absolute', left: 20, top: hp(20) }}
            >
            <Image width={20} height={20} resizeMode={'center'} source={require('../../../assets/zoom-in.png')} />
        </AwesomeButton> */}
        <Box h={imgSize.height} w={imgSize.width}>
          {/* Gesture work start here by Abdulmutalib */}
            <PanGestureHandler 
              ref={panRef}
              simultaneousHandlers={[rotationRef, pinchRef]}
              minPointers={2} 
              onGestureEvent={handlePan} 
              onHandlerStateChange={onHandlePanState} >
              <Animated.View style={{ width: imgSize.width, height: imgSize.height, transform:[{translateY}, {translateX}] }}>
                <PinchGestureHandler 
                  ref={pinchRef}
                  simultaneousHandlers={rotationRef}
                  minPointers={2}
                  onGestureEvent={onGestureEvent}
                  onHandlerStateChange={onPinchStateChange}
                  >
                  <Animated.View style={{ width: imgSize.width, height: imgSize.height, transform:[{scale}] }}>
                    <RotationGestureHandler 
                      ref={rotationRef}
                      simultaneousHandlers={pinchRef}
                      minPointers={2}
                      onGestureEvent={onRotateGestureEvent}
                      onHandlerStateChange={onRotateHandlerStateChange}
                      >
                      <Animated.View style={{ width: imgSize.width, height: imgSize.height, transform: [{perspective: 200}, {rotate: _rotateStr}] }}>
                          <SignatureScreen
                            ref={ref}
                            dataURL={dataURL ? dataURL : undefined}
                            overlaySrc={route.params.imageUrl} //"https://i.ibb.co/hYYc1tg/1-scaled.png" //{route.params.imageUrl}
                            overlayWidth={imgSize.width}
                            overlayHeight={imgSize.height}
                            webStyle={webStyles}
                            onBegin={() => setEditing(true)}
                            onOK={handleOK}
                            minWidth={5}
                            maxWidth={5}
                            onEmpty={handleEmpty}
                            onGetData={handleData}
                            style={{ zIndex: 1 }}
                          />
                      </Animated.View>
                    </RotationGestureHandler>
                  </Animated.View>
                </PinchGestureHandler>
              </Animated.View>
            </PanGestureHandler>
            {/* Gesture work end here by Abdulmutalib */}
        </Box>
        <VStack alignItems="center" justifyContent="space-evenly" flex={1}>
          <SignaturePage refs={ref} />

          {/* <FlatList
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
          /> */}
          <HStack
            width={wp(90)}
            style={{ height: 40 }}
            alignItems="center"
            justifyContent="space-evenly"
          >
            <AwesomeButton
              onPress={() => {
                RootNavigation.navigate("BotNav", {
                  screen: "Dashboard",
                  params: { screen: "Catalogue" },
                });
              }}
              height={40}
              borderRadius={2000}
              width={wp(40)}
              backgroundColor={colors.blue}
              backgroundDarker={colors.lightGrey}
              raiseLevel={2}
            >
              <Text color="#fff" fontSize="xl" fontWeight={600}>
                Catalogue
              </Text>
            </AwesomeButton>
            <AwesomeButton
              onPress={() => {
                setSaveModal(true);
              }}
              height={40}
              width={wp(30)}
              borderRadius={2000}
              backgroundColor={colors.green}
              backgroundDarker={colors.lightGrey}
              raiseLevel={2}
              >
              <Text color="#fff" fontSize="xl">
                Save
              </Text>
            </AwesomeButton>
          </HStack>
        </VStack>
      </Box>
    </>
  );
}

const stylePaint = StyleSheet.create({
  previewText: {
    opacity: 0.8
  }
});
