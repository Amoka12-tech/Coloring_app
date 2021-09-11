import React, { useEffect, useState } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import {
  FlatList,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Box, Text } from "native-base";
import AwesomeButton from "@umangmaurya/react-native-really-awesome-button";
import { colors } from "../../../Theme";
import { createStackNavigator } from "@react-navigation/stack";
import Catalogue from "./Catalogue";
import CachedImage from "../../components/CachedImage";
import { getImageUrls } from "../../apis/imageUrls";
import { getHashes } from "../../apis/hashedUrls";
import { useDispatch, useSelector } from "react-redux";
import { setUrls } from "../../redux/reducers/imageUrls";
import { setDrawings } from "../../redux/reducers/drawings";
import * as RootNavigation from "../../../RootNavigation";
import * as FileSystem from "expo-file-system";

const Stack = createStackNavigator();

function Dashboard({ navigation }) {
  const boxWidth = wp(40);
  const [newPortraits, setNewPortraits] = useState(true);
  const [imageURLs, setImageURLs] = useState([]);
  const [imageHashes, setImageHashes] = useState([]);
  const dispatch = useDispatch();
  const imagesState = useSelector((state) => state.images);
  const drawingsState = useSelector((state) => state.drawings);

  useEffect(() => {
    return navigation.addListener("blur", () => setImageHashes([]));
  }, []);

  useEffect(() => {
    return navigation.addListener("focus", () => loadProjects());
  }, []);

  const loadProjects = () => {
    console.log("Loading projects");
    let urlsSet = false,
      hashesSet = false;
    if (imagesState.length !== 0) {
      setImageURLs(imagesState);
      urlsSet = true;
    }
    if (drawingsState.length !== 0) {
      loadCurrentProjects(drawingsState).then(() => (hashesSet = true));
    }
    (async (urlsSet, hashesSet) => {
      const urls = urlsSet ? imagesState : await getImageUrls();
      if (!urlsSet) {
        setImageURLs(urls);
        dispatch(setUrls(urls));
      }
      if (hashesSet) return;
      const hashes = await getHashes(urls);
      await loadCurrentProjects(hashes);
      dispatch(setDrawings(hashes));
    })(urlsSet, hashesSet);
  };

  const loadCurrentProjects = async (hashes) => {
    try {
      const sigsDir = `${FileSystem.documentDirectory}sigs`;
      const { exists } = await FileSystem.getInfoAsync(sigsDir);
      if (!exists) await FileSystem.makeDirectoryAsync(sigsDir);
      const files = await FileSystem.readDirectoryAsync(sigsDir);
      setImageHashes(hashes.filter((hashObj) => files.includes(hashObj.hash)));
    } catch (error) {
      console.error(error);
    }
  };

  const NewPortraitsAvailability = () => (
    <Box
      bg={colors.lightGrey}
      height={hp(25)}
      safeArea
      flexDirection="row"
      alignItems="center"
      justifyContent="space-evenly"
    >
      <Box>
        <Text fontSize="2xl" fontWeight={600}>
          New Portraits Available!
        </Text>
        <Text color="#777" fontSize="sm" marginBottom={hp(1)}>
          Lorem ipsum dolor amet, consectetur
        </Text>
        <AwesomeButton
          onPress={() => {
            // setNewPortraits(false);
            navigation.navigate("Catalogue");
          }}
          width={wp(30)}
          borderRadius={20}
          height={35}
          textColor="#fff"
          textSize={16}
          backgroundColor={colors.purple}
          backgroundDarker={colors.purple_darker}
          raiseLevel={3}
        >
          View All
        </AwesomeButton>
      </Box>
      <Box
        w={wp(20)}
        h={wp(20)}
        borderColor="#000"
        borderWidth={2}
        borderRadius={5}
      />
    </Box>
  );

  const CurrentProjectList = () => (
    <>
      <View
        style={{
          marginHorizontal: wp(6),
          marginTop: hp(2),
          marginBottom: hp(1),
        }}
      >
        <Text fontSize="2xl" fontWeight={600}>
          Current Projects
        </Text>
      </View>
      <FlatList
        horizontal
        data={imageHashes}
        contentContainerStyle={{
          paddingHorizontal: wp(5),
        }}
        decelerationRate="fast"
        snapToInterval={boxWidth + 10}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={1}
        keyExtractor={(item, index) => `${index}-${item}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              RootNavigation.navigate("Painting", { imageUrl: item.url });
            }}
          >
            <ImageBackground
              style={{
                height: hp(32),
                width: boxWidth,
                marginHorizontal: 5,
              }}
              source={{
                uri: `${FileSystem.documentDirectory}sigs/${
                  item.hash
                }?_=${Date.now()}`,
              }}
            >
              <CachedImage
                style={{
                  height: hp(32),
                  width: boxWidth,
                  borderWidth: 2,
                  borderColor: "black",
                }}
                source={{ uri: item.url }}
                compressed
              />
            </ImageBackground>
          </TouchableOpacity>
        )}
      />
    </>
  );

  const Catalogue = () => (
    <>
      <View
        style={{
          marginHorizontal: wp(6),
          marginTop: hp(4),
          marginBottom: hp(1),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text fontSize="2xl" fontWeight={600}>
          Catalogue
        </Text>
        <TouchableOpacity
          onPress={() => {
            setNewPortraits(true); //TO-DO: remove this line
            navigation.navigate("Catalogue");
          }}
        >
          <Text fontSize="lg" color={colors.grey} marginRight={5}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={imageURLs}
        contentContainerStyle={{
          paddingHorizontal: wp(5),
          paddingBottom: hp(2),
        }}
        decelerationRate="fast"
        snapToInterval={boxWidth + 10}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={1}
        keyExtractor={(item, index) => `${index}-${item}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              RootNavigation.navigate("Painting", { imageUrl: item });
            }}
          >
            <CachedImage
              style={{
                marginHorizontal: 5,
                borderWidth: 2,
                borderColor: "black",
                height: hp(32),
                width: boxWidth,
                backgroundColor: "white",
              }}
              source={{ uri: item }}
              compressed
            />
          </TouchableOpacity>
        )}
      />
    </>
  );

  return (
    <Box safeArea={newPortraits ? 0 : true}>
      <ScrollView>
        {newPortraits && <NewPortraitsAvailability />}
        {imageHashes.length > 0 && <CurrentProjectList />}
        <Catalogue />
      </ScrollView>
    </Box>
  );
}

export default () => (
  <Stack.Navigator
    initialRouteName="Dashboard"
    screenOptions={{
      header: () => null,
      cardStyle: { backgroundColor: "transparent" },
    }}
  >
    <Stack.Screen name="Dashboard" component={Dashboard} />
    <Stack.Screen name="Catalogue" component={Catalogue} />
  </Stack.Navigator>
);
