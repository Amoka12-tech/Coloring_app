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

export default function Painting({ navigation, route }) {
  const [colorArr, setColorArr] = useState([]);
  const [hue, setHue] = useState("360");
  const [saturation, setSaturation] = useState(80);
  const [lightness, setLightness] = useState(75);
  const [isDrawing, setIsDrawing] = useState(true);
  const [isZooming, setIsZooming] = useState(false);
  const [drawingModal, setDrawingModal] = useState(false);
  const [erasingModal, setErasingModal] = useState(false);
  const [dataURL, setDataURL] = useState(null);
  const [filesystemURI, setFilesystemURI] = useState(null);
  const [warning, setWarning] = useState(false);
  const [thickness, setThickness] = useState(5);
  const [opacityOpt, setOpacityOpt] = useState(1);
  const [blur, setBlur] = useState(0);
  const [saveModal, setSaveModal] = useState(false);
  const [drawingName, setDrawingName] = useState('');
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

  const { imageUrl, itemHash } = route.params;

  const [penColorHSL, setPenColorHSL] = useState('');

  const roundOpt = Math.round (opacityOpt * 10) / 10;

  const loadLocaStorage = async () => {
    const storeDrawings = await AsyncStorage.getItem('@drawings');
    const drawingsParse = storeDrawings != null ? JSON.parse(storeDrawings) : null;
    setJsonDrawings(drawingsParse);
    getImageSettings(drawingsParse);
    // console.log("focus");
  };

  // useEffect(() => {
  //   return navigation.addListener("blur", () => setIsPageFocused(false));
  // },[]);

  useEffect(() => {
    return navigation.addListener("focus", () => loadLocaStorage());
  }, []);
  
  const drawingArray = jsonDrawings;
  // console.log('Image:',imageDetails);
  const imageObj = {
    id: imageUrl,
    name: drawingName,
  };

  const getImageSettings = (value) => {
    const singleImageDetails = value?.filter(value => value.id === imageUrl);
    if(singleImageDetails != undefined && isPageFocused !== true){
      // console.log('Image:',singleImageDetails);
      setDrawingName(singleImageDetails[0].name);
      setIsPageFocused(true);
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
      await FileSystem.writeAsStringAsync(
        filesystemURI,
        signature.replace("data:image/png;base64,", ""),
        { encoding: FileSystem.EncodingType.Base64 },
      );
      
      
      // const drawing = await FileSystem.getInfoAsync(filesystemURI);
      // console.log('Name',drawing);
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
      navigation.goBack();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isDrawing && !isZooming) ref.current.draw();
    else ref.current.erase();
  }, [isDrawing, isZooming]);

  useEffect(() => {
    ref.current.changePenColor(
      penColorHSL
    );
    // console.log(penColorHSL);
  }, [hue, saturation, lightness]);

  useEffect(() => {
    ref.current.changePenSize(thickness, thickness);
  }, [thickness]);

  useEffect(() => {
    const arr = [];
    for (let i = nColors; i > 0; i--)
      arr.push(`hsl(${i * (360 / nColors)}, ${saturation}%, ${lightness}%)`);
    setColorArr(arr);
  }, [lightness]);

  useEffect(() => {
    if (!filesystemURI) return;

    FileSystem.getInfoAsync(filesystemURI).then(async ({ exists }) => {
      if (exists) {
        const base64 = await FileSystem.readAsStringAsync(filesystemURI, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setDataURL(`data:image/png;base64,${base64}`);
      }
    });
  }, [filesystemURI]);

  useEffect(() => {
    const hash = checkForHash();
    if (hash)
      return setFilesystemURI(`${FileSystem.documentDirectory}sigs/${hash}`);
    Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      route.params.imageUrl
    )
      .then((hash) => `${FileSystem.documentDirectory}sigs/${hash}`)
      .then(setFilesystemURI)
      .catch(console.error);
  }, []);

  const style = `.m-signature-pad {box-shadow: none; border: none; } 
                 .m-signature-pad--body {border: none;}
                 .m-signature-pad--footer {display: none; margin: 0px;}
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
        ref.current.changePenColor(
          'rgba('+r+', '+g+', '+b+', '+roundOpt+')'
        );
  }, [opacityOpt, hue, saturation, lightness]);

  const scale = React.useRef(new Animated.Value(1)).current;
  const translateX = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;
  const onGestureEvent = Animated.event([{
    nativeEvent: {scale}
  }],
  {useNativeDriver:true}
  );

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
        <Box safeAreaTop />

        <HStack px={5} justifyContent="space-between" alignItems="center">
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

      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', }}>
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
            height: hp(30),
            backgroundColor: colors.lightGrey,
            borderRadius: 15,
          }}
        >
          <Box
            w={wp(70)}
            h={hp(10)}
            bg="#f43f5e"
            borderTopLeftRadius={15}
            borderTopRightRadius={15}
            justifyContent="center"
            alignItems="center"
          >
            <AntDesign name="warning" size={hp(7)} color={colors.lightGrey} />
          </Box>
          <VStack justifyContent="space-between" flex={1}>
            <Text fontSize={hp(4)} alignSelf="center" fontWeight={600}>
              Warning!
            </Text>
            <Text alignSelf="center" w={wp(50)} textAlign="center">
              You have unsaved changes, would you like to save them first?
            </Text>
            <Box
              flexDirection="row"
              justifyContent="space-evenly"
              pb={3}
              alignItems="flex-end"
            >
              <Button
                colorScheme="danger"
                _text={{
                  color: "white",
                }}
                w={wp(25)}
                onPress={() => navigation.goBack()}
              >
                Discard
              </Button>
              <Button
                colorScheme="teal"
                w={wp(25)}
                onPress={() => {
                  setWarning(false);
                  setIsPageFocused(false);
                  setSaveModal(true);
                }}
              >
                Save
              </Button>
            </Box>
          </VStack>
        </View>
      </Modal>

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
            height: hp(62),
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
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            w={wp(80)}
            >
            <Text fontSize="sm" color="#fff" ml={2}>
              Size
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
          </Box>
          <Box
            flex={1}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            w={wp(80)}
            >
            <Text fontSize="sm" color="#fff" ml={2}>
              Opacity
            </Text>
            <Box w={wp(50)}>
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
          </Box>
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
                onSlidingComplete={setThickness}
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

      <Modal 
       isOpen={saveModal}
       overlayVisible={true}
       onClose={() => setWarning(false)}
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
        <AwesomeButton
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
        </AwesomeButton>
        <Box h={imgSize.height} w={imgSize.width}>
          {/* Gesture work start here by Abdulmutalib */}
            <PanGestureHandler enabled={isZooming} onGestureEvent={handlePan} >
              <Animated.View style={{ width: imgSize.width, height: imgSize.height }}>
                <PinchGestureHandler 
                  enabled={isZooming}
                  onGestureEvent={onGestureEvent}
                  >
                  <Animated.View style={{ width: imgSize.width, height: imgSize.height, transform:[{scale}, {translateY}, {translateX}] }}>
                    <RotationGestureHandler 
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
                            minWidth={thickness}
                            maxWidth={thickness}
                            onEmpty={handleEmpty}
                            onGetData={handleData}
                            penColor={penColorHSL}
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
          <HStack
            width={wp(90)}
            alignItems="center"
            justifyContent="space-between"
            >
            <AwesomeButton
              onPress={() => {
                isDrawing ? setIsDrawing(false) : setErasingModal(true);
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
              onValueChangeEnd={(value) => setLightness(90 - value + 60)}
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
                  setHue(item.substr(4, 3).split(",")[0]);
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
