import { useConnection } from "./ConnectionContext";

export const useLedApi = () => {
  const { request } = useConnection();

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
  };
};
