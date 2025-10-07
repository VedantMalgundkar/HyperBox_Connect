import { useConnection } from "./ConnectionContext";

export const useSysApi = () => {
  const { request } = useConnection();

  return {
    setHostname: async (hostname: string) => request('/set-unique-hostname', 'POST', {'hostname': hostname }),
    scanNearbyNetworks: async () => request('/scan-wifi', 'GET'),
    getConnectedWifi: async () => request('/get-connected-wifi','GET'),
    getMac: async () => request('/get-mac', 'GET'),
  };
};