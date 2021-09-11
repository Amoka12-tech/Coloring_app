import * as Crypto from 'expo-crypto';

let hashes = [];
export const getHashes = async (urls) => {
  if (hashes.length > 0) return hashes;
  for (const url of urls) {
    try {
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        url
      );
      hashes.push({ hash, url });
    } catch (error) {
      console.log(error);
      return [];
    }
  }
  return hashes;
};

export const checkForHash = (url) => {
  for (const hashObj of hashes) if (hashObj.url === url) return hashObj.hash;
  return null;
};

export const checkForUrl = (hash) => {
  for (const hashObj of hashes) if (hashObj.hash === hash) return hashObj.url;
  return null;
};
