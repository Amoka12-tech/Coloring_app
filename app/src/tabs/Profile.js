import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FlatList,
  HamburgerIcon,
  HStack,
  Image,
  Input,
  Menu,
  Modal,
  Spinner,
  Text,
  VStack,
  useToast,
} from "native-base";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import {
  ImageBackground,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import AwesomeButton from "@umangmaurya/react-native-really-awesome-button";
import { colors } from "../../Theme";
import { useDispatch, useSelector } from "react-redux";
import { clearUrls, setUrls } from "../redux/reducers/imageUrls";
import CachedImage from "../components/CachedImage";
import { getImageUrls } from "../apis/imageUrls";
import * as RootNavigation from "../../RootNavigation";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { getHashes } from "../apis/hashedUrls";
import { clearDrawings, setDrawings } from "../redux/reducers/drawings";
import { clearCatalogue } from "../redux/reducers/catalogue";

export default function Profile({ navigation }) {
  const [openTab, setOpenTab] = useState("current");
  const [imageURLs, setImageURLs] = useState([]);
  const [imageHashes, setImageHashes] = useState([]);
  const [imageUri, setImageUri] = useState("");
  const [name, setName] = useState("");
  const [nameModal, setNameModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const dispatch = useDispatch();
  const imagesState = useSelector((state) => state.images);
  const drawingsState = useSelector((state) => state.drawings);
  const profilePicDir = `${FileSystem.documentDirectory}profile/pic`;
  const toast = useToast();

  useEffect(() => {
    return navigation.addListener("blur", () => setImageHashes([]));
  }, []);

  useEffect(() => {
    return navigation.addListener("focus", () => loadProjects());
  }, []);

  useEffect(() => {
    (async () => {
      await getName();
      const { exists } = await FileSystem.getInfoAsync(profilePicDir);
      if (exists) setImageUri(profilePicDir);
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (res.status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return null;
      }
    }

    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
  };

  const loadProjects = () => {
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
    const sigsDir = `${FileSystem.documentDirectory}sigs`;
    const { exists } = await FileSystem.getInfoAsync(sigsDir);
    if (!exists) await FileSystem.makeDirectoryAsync(sigsDir);
    const files = await FileSystem.readDirectoryAsync(sigsDir);
    setImageHashes(hashes.filter((hashObj) => files.includes(hashObj.hash)));
  };

  const clearCache = () => {
    setIsSpinning(true);
    FileSystem.readDirectoryAsync(FileSystem.documentDirectory)
      .then(async (arr) => {
        return Promise.all(
          arr.map(async (path) => {
            await FileSystem.deleteAsync(
              `${FileSystem.documentDirectory}${path}`,
              {
                idempotent: true,
              }
            );
          })
        );
      })
      .then(() => {
        dispatch(clearCatalogue());
        dispatch(clearDrawings());
        dispatch(clearUrls());
      })
      .then(() => {
        setIsSpinning(false);
        toast.show({
          title: "Please reload the app",
          placement: "bottom",
          status: "info",
        });
      })
      .catch(console.error);
  };

  const AppBar = () => (
    <HStack px={5} py={3} justifyContent="space-between" alignItems="center">
      <Box />
      <Menu
        trigger={(triggerProps) => {
          return (
            <Pressable {...triggerProps}>
              <HamburgerIcon />
            </Pressable>
          );
        }}
      >
        <Menu.Item style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => clearCache()}>
            <View>
              <Text>Clear Cache</Text>
            </View>
          </TouchableOpacity>
          {isSpinning && <Spinner size="sm" ml={1} />}
        </Menu.Item>
      </Menu>
    </HStack>
  );

  const setProfileImage = async (uri) => {
    try {
      setImageUri(uri);
      await FileSystem.deleteAsync(profilePicDir, { idempotent: true });
      await FileSystem.copyAsync({ from: uri, to: profilePicDir });
    } catch (error) {
      console.error(error);
    }
  };

  const saveName = async (value) => {
    setName(value);
    await SecureStore.setItemAsync("name", value);
  };

  const getName = async () => {
    let result = await SecureStore.getItemAsync("name");
    setName(result ? result : "Your name");
  };

  const ProfileImage = () => (
    <>
      <TouchableOpacity
        onPress={async () => {
          const result = await pickImage([1, 1]);
          if (result !== null && !result.cancelled)
            await setProfileImage(result.uri);
        }}
        style={{ alignItems: "center" }}
      >
        <Image
          alt="profilePicture"
          borderRadius={hp(100)}
          w={wp(30)}
          h={wp(30)}
          bg="#aaa"
          source={imageUri ? { uri: imageUri } : null}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setNameModal(true)}>
        <Text fontSize="2xl" my={3}>
          {name}
        </Text>
      </TouchableOpacity>
    </>
  );

  const ListTabs = () => (
    <HStack
      px={8}
      py={3}
      justifyContent="space-evenly"
      alignItems="center"
      w={wp(100)}
    >
      {/* <AwesomeButton
        onPress={() => {
          setOpenTab('saved');
        }}
        width={wp(25)}
        borderRadius={20}
        height={35}
        backgroundColor={openTab === 'saved' ? colors.purple : colors.lightGrey}
        backgroundDarker={
          openTab === 'saved' ? colors.purple_darker : colors.grey
        }
        raiseLevel={2}
      >
        <Text
          color={openTab === 'saved' ? '#fff' : colors.grey}
          fontSize="md"
          fontWeight={600}
        >
          Saved Work
        </Text>
      </AwesomeButton> */}
      <AwesomeButton
        onPress={() => {
          setOpenTab("current");
        }}
        width={wp(35)}
        borderRadius={20}
        height={35}
        backgroundColor={
          openTab === "current" ? colors.purple : colors.lightGrey
        }
        backgroundDarker={
          openTab === "current" ? colors.purple_darker : colors.grey
        }
        raiseLevel={2}
      >
        <Text
          color={openTab === "current" ? "#fff" : colors.grey}
          fontSize="md"
          fontWeight={600}
        >
          Current
        </Text>
      </AwesomeButton>
      <AwesomeButton
        onPress={() => {
          setOpenTab("completed");
        }}
        width={wp(35)}
        borderRadius={20}
        height={35}
        backgroundColor={
          openTab === "completed" ? colors.purple : colors.lightGrey
        }
        backgroundDarker={
          openTab === "completed" ? colors.purple_darker : colors.grey
        }
        raiseLevel={2}
      >
        <Text
          color={openTab === "completed" ? "#fff" : colors.grey}
          fontSize="md"
          fontWeight={600}
        >
          Completed
        </Text>
      </AwesomeButton>
    </HStack>
  );

  return (
    <>
      <StatusBar backgroundColor={nameModal ? "rgba(0,0,0,0.3)" : undefined} />
      <Box safeAreaTop />
      <AppBar />

      <Modal
        isOpen={nameModal}
        overlayVisible={true}
        onClose={() => setNameModal(false)}
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
          <VStack justifyContent="space-evenly" flex={1}>
            <Text fontSize={hp(3)} alignSelf="center" fontWeight={600}>
              Enter your name
            </Text>
            <Input
              w={wp(65)}
              alignSelf="center"
              value={tempName}
              onChangeText={setTempName}
              placeholder="Name"
            />
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
                onPress={() => {
                  setNameModal(false);
                  setTempName("");
                }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                w={wp(25)}
                onPress={async () => {
                  console.log(tempName);
                  await saveName(tempName);
                  setTempName("");
                  setNameModal(false);
                }}
              >
                Save
              </Button>
            </Box>
          </VStack>
        </View>
      </Modal>

      <Box flex={1} alignItems="center">
        <ProfileImage />
        <ListTabs />
        <FlatList
          data={imageHashes}
          numColumns={2}
          showsVerticalScrollIndicator={false}
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
                  width: wp(40),
                  marginHorizontal: 5,
                  marginVertical: 7,
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
                    width: wp(40),
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
      </Box>
    </>
  );
}
