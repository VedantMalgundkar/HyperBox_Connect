import { useConnection } from "./ConnectionContext";

export const useSysApi = () => {
  const { request } = useConnection();

  return {
    setHostname: (hostname: string) => request('/set-unique-hostname', 'POST', {'hostname': hostname }),
  };
};
