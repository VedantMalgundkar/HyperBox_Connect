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