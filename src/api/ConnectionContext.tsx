// src/api/ConnectionContext.tsx
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { BleManager } from "react-native-ble-plx";

// Types
type ConnectionContextType = {
  // HTTP
  baseUrl: string | null;
  setBaseUrl: (url: string | null) => void;
  api: AxiosInstance | null;
  request: <T = any>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any
  ) => Promise<T>;

  HyperRequest: <T = any>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any
  ) => Promise<T>;

  // WS
  ws: WebSocket | null;
  disconnectWS: () => void;

  // BLE
  bleManager: BleManager;
  bleDeviceId: string | null;
  setBleDevice: (id: string | null) => void;
};

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [baseUrl, setBaseUrl] = useState<string | null>(null);

  // Axios instance rebuilds whenever baseUrl changes
  const api = useMemo(() => {
    if (!baseUrl) return null;

    const instance = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use(
      (config) => {
        // const token = "YOUR_JWT_TOKEN";
        // if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error?.response?.data || error.message);
        return Promise.reject(error);
      }
    );

    return instance;
  }, [baseUrl]);

  const hyperApi = useMemo(() => {
    if (!baseUrl) return null;
    const url8090 = baseUrl.replace(/:\d+/, ":8090");

    const instance = axios.create({
      baseURL: url8090.toString(),
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error?.response?.data || error.message);
        return Promise.reject(error);
      }
    );

    return instance;
  }, [baseUrl]);

  // Generic request wrappers
  const request = async <T = any>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any
  ): Promise<T> => {
    if (!api) throw new Error("Base URL not set yet");
    const config: AxiosRequestConfig = { url, method, data: body };
    const res = await api(config);
    return res.data;
  };

  const HyperRequest = async <T = any>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any
  ): Promise<T> => {
    if (!hyperApi) throw new Error("Base URL not set yet");
    const config: AxiosRequestConfig = { url, method, data: body };
    const res = await hyperApi(config);
    return res.data;
  };

  // --- WebSocket ---
  const makeWsUrl = (source: string): string => {
    let wsUrl = source.replace(/^http/, "ws");

    if (/:\d+/.test(wsUrl)) {
      wsUrl = wsUrl.replace(/:\d+/, ":8090");
    } else {
      wsUrl = wsUrl.replace(/(ws:\/\/[^/]+)/, "$1:8090");
    }

    return wsUrl;
  };

  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!baseUrl) {
      if (ws) {
        ws.close();
        setWs(null);
      }
      return;
    }

    const wsUrl = makeWsUrl(baseUrl);
    const socket = new WebSocket(wsUrl);
    setWs(socket);

    socket.onopen = () => console.log("✅ WebSocket connected:", wsUrl);
    // socket.onerror = (err) => console.error("❌ WebSocket error:", err);
    // socket.onclose = () => console.log("⚠️ WebSocket closed:", wsUrl);

    return () => {
      socket.close();
      setWs(null);
    };
  }, [baseUrl]);

  const disconnectWS = () => {
    ws?.close();
    setWs(null);
  };

  // --- BLE ---
  const [bleDeviceId, setBleDeviceId] = useState<string | null>(null);
  const bleManager = useMemo(() => new BleManager(), []);

  return (
    <ConnectionContext.Provider
      value={{
        baseUrl,
        setBaseUrl,
        api,
        request,
        HyperRequest,
        ws,
        disconnectWS,
        bleManager,
        bleDeviceId,
        setBleDevice: setBleDeviceId,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error("useConnection must be used inside ConnectionProvider");
  return ctx;
};
