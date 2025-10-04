import { Linking, Platform } from 'react-native';

const IS_ANDROID = Platform.OS === 'android';
export const WhichPltform = IS_ANDROID ? 'android' : 'ios'

export const isEmptyObject = (obj: any) => obj && Object.keys(obj).length === 0 && obj.constructor === Object;

export const changePortOrProtoOfUrl = (
  source: string,
  protocol?: string,
  port?: number
): string => {
  let result = source;

  // Change protocol if given
  if (protocol) {
    result = result.replace(/^[a-zA-Z]+:\/\//, `${protocol}://`);
  }

  if (port) {
    if (/:\d+/.test(result)) {
      // Replace existing port
      result = result.replace(/:(\d+)/, `:${port}`);
    } else {
      // Insert new port before first slash or end of string
      result = result.replace(/^(.*?:\/\/[^/]+)(\/.*)?$/, `$1:${port}$2`);
    }
  }

  return result;
};

export const extractHostFromUrl = (source: string): string => {
  return source
    .replace(/^[a-zA-Z]+:\/\//, "") // remove protocol
    .replace(/:\d+$/, "")           // remove trailing port
    .replace(/\/.*$/, "");          // remove path
};

export const openLinkInBrowser = async (url: string) => {
  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log(`Don't know how to open this URL: ${url}`);
    }
  } catch (err) {
    console.error("Failed to open URL:", err);
  }
};