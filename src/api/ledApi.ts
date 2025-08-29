import { useConnection } from "./ConnectionContext";

export const useLedApi = () => {
  const { request, HyperRequest } = useConnection();

  return {
    getLedBrightness: () => request("/led/get-brightness", "GET"),
    getLedEffects: () => request("/led/get-effects", "GET"),
    getCurrentActiveInput: () => request("/led/get-active-signal", "GET"),

    applyEffect: (effect: string) =>
      request("/led/apply-effect", "POST", { effect: effect.trim() }),

    applyColor: (colorArray: number[]) =>
      request("/led/apply-color", "POST", { color: colorArray }),

    stopEffect: (priority: number) =>
      request("/led/stop-effect", "POST", { priority }),

    adjustLedBrightness: (brightness: number) =>
      request("/led/adjust-brightness", "POST", { brightness }),

    // 🔥 New function using HyperRequest
    getLedPositionData: async (): Promise<any[]> => {
      console.log("in getLedPositionData >>>>");
      const payload = { command: "serverinfo" };
      
      const response = await HyperRequest("/json-rpc", "POST", payload);

      if (!response?.info?.leds) {
        throw new Error("LED data not available");
      }

      console.log("getLedPositionData >>>>", response.info.leds.length);

      return response.info.leds;
    },
  };
};
