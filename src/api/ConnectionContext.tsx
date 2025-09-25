// src/api/ConnectionContext.tsx
import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from "react";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { BleManager, Device } from "react-native-ble-plx";
import { useNetworkDialog } from "./NetworkDialogContext";
import { changePortOrProtoOfUrl } from "../utils/helper";

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
  handleConnect: (device: Device) => void;
  handleDisconnect: () => void;
  bleDevice: Device | null;
};

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const {showErrorDialog} = useNetworkDialog()

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
        console.error("API Error: from context >>", error?.response?.data || error.message);
        showErrorDialog();
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
        console.error("hyperAPI Error: from context >>>>", error?.response?.data || error.message);
        showErrorDialog();
        return Promise.reject(error);
      }
    );

    return instance;
  }, [baseUrl]);

  const bleManager = useMemo(() => new BleManager(), []);

  useEffect(() => {
    return () => {
      bleManager.destroy(); // release native resources
    };
  }, [bleManager]);

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
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!baseUrl) {
      if (ws) {
        ws.close();
        setWs(null);
      }
      return;
    }

    // const wsUrl = makeWsUrl(baseUrl);
    const wsUrl = changePortOrProtoOfUrl(baseUrl, "ws", 8090);
    const socket = new WebSocket(wsUrl);
    setWs(socket);

    socket.onopen = () => console.log("✅ WebSocket connected: from context >>>", wsUrl);
    socket.onerror = (err) => {
      showErrorDialog();
      console.error("❌ WebSocket error:", err);
    }
    socket.onclose = () => {
      showErrorDialog();
      console.log("⚠️ WebSocket closed: from context >>", wsUrl);
    }

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
  const [bleDevice, setBleDevice] = useState<Device | null>(null);

  // refs
  // const bleManagerRef = useRef<BleManager>(new BleManager());
  // const bleConnectionRef = useRef<Device | null>(null);

  const handleConnect = (device: Device) => {
    // bleConnectionRef.current = device;
    setBleDevice(device);
  };

  const handleDisconnect = () => {
      // bleConnectionRef.current = null;
      setBleDevice(null);
    }
  

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
        handleConnect,
        handleDisconnect,
        bleDevice,
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
