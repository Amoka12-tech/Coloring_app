import React, { useState, useEffect } from 'react';
import { HStack, Icon, Text, Box, FlatList } from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { setUrls } from '../../redux/reducers/imageUrls';
import CachedImage from '../../components/CachedImage';
import { getImageUrls } from '../../apis/imageUrls';
import * as RootNavigation from '../../../RootNavigation';

export default function Catalogue({ navigation }) {
  const [imageURLs, setImageURLs] = useState([]);
  const dispatch = useDispatch();
  const imagesState = useSelector((state) => state.images);

  useEffect(() => {
    if (imagesState.length != 0) return setImageURLs(imagesState);

    const urls = getImageUrls();
    setImageURLs(urls);
    dispatch(setUrls(urls));
  }, []);

  const AppBar = () => {
    return (
      <>
        <Box safeAreaTop/>

        <HStack
          px={5}
          py={3}
          justifyContent="space-between"
          alignItems="center"
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              as={<MaterialIcons name="arrow-back-ios"/>}
              size="sm"
              color="black"
            />
          </TouchableOpacity>
          <Text fontSize={28} fontWeight={600}>
            Catalogue
          </Text>
          <TouchableOpacity>
            <Box w={6}/>
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
      <AppBar/>
      <Box flex={1} justifyContent="center" alignItems="center">
        <FlatList
          data={imageURLs}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => `${index}-${item}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                RootNavigation.navigate('Painting', { imageUrl: item });
              }}
            >
              <CachedImage
                style={{
                  marginHorizontal: 5,
                  marginVertical: 5,
                  borderWidth: 2,
                  borderColor: 'black',
                  height: wp(60),
                  width: wp(40),
                }}
                source={{ uri: item }}
                compressed
              />
            </TouchableOpacity>
          )}
        />
      </Box>
    </>
  );
}
