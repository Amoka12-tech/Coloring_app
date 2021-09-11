import React, { useState, useEffect } from "react";
import { Image, ImageBackground } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import * as ImageManipulator from "expo-image-manipulator";
import { useSelector, useDispatch } from "react-redux";
import { addToCatalogue } from "../redux/reducers/catalogue";

export default (props) => {
  const [imgURI, setImgURI] = useState("");
  const dispatch = useDispatch();
  const catalogueState = useSelector((state) => state.catalogue);

  useEffect(() => {
    Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      props.source.uri
    )
      .then((hashed) => `${FileSystem.documentDirectory}${hashed}`)
      .then(async (filesystemURI) => {
        try {
          const uriToSearch = props.compressed
            ? `${filesystemURI}-small`
            : filesystemURI;

          // First look for the image uri in redux state
          if (catalogueState.includes(uriToSearch)) {
            setImgURI(uriToSearch);
            return;
          }

          // Then look in the file system
          const { exists } = await FileSystem.getInfoAsync(uriToSearch);
          if (exists) {
            setImgURI(uriToSearch);
            dispatch(addToCatalogue(uriToSearch));
            return;
          }

          // Otherwise download and save the image
          await downloadImage(filesystemURI);
        } catch (err) {
          setImgURI(props.source.uri);
          return err;
        }
      })
      .catch(console.error);
  }, []);

  const downloadImage = async (filesystemURI) => {
    // Download the original image
    const downloadedImage = await FileSystem.downloadAsync(
      props.source.uri,
      filesystemURI
    );

    // Compress the image for quicker loading
    const compressedImage = await ImageManipulator.manipulateAsync(
      downloadedImage.uri,
      [],
      { compress: 0, format: ImageManipulator.SaveFormat.PNG }
    );

    // Save the compressed image
    FileSystem.copyAsync({
      from: compressedImage.uri,
      to: `${filesystemURI}-small`,
    });

    const downloadedUri = props.compressed
      ? compressedImage.uri
      : downloadedImage.uri;

    dispatch(addToCatalogue(downloadedUri));
    setImgURI(downloadedUri);
  };

  return props.background ? (
    <ImageBackground {...props} source={imgURI ? { uri: imgURI } : null}>
      {props.children}
    </ImageBackground>
  ) : (
    <Image {...props} source={imgURI ? { uri: imgURI } : null} />
  );
};
