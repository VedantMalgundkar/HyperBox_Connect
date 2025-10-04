export interface Priority {
  active: boolean;
  componentId: "VIDEOGRABBER" | "COLOR" | "PROTOSERVER" | "EFFECT";
  origin: string;
  owner?: string;
  priority: number;
  visible: boolean;
  isFallBack?: boolean;

  value?: {
    HSL?: number[];
    RGB?: number[];
  };
}

export interface InputTile extends Priority {
  key: string;
  label?: string;
  icon?: React.ReactNode;
}

export interface WsBaseResponse {
  command: string;
  success: boolean;
  tan: number;
}

// priorities-update
export interface WsPrioritiesUpdate extends WsBaseResponse {
  command: "priorities-update";
  data: {
    priorities: Priority[];
    priorities_autoselect: boolean;
  };
}

// ledcolors-ledstream-update
export interface WsLedStreamUpdate extends WsBaseResponse {
  command: "ledcolors-ledstream-update";
  result: {
    leds: number[];
  };
}

// protoServer port
export interface WsConfigGetConfig extends WsBaseResponse {
  command: "config-getconfig";
  info: {
    protoServer: {
      enable: boolean;
      port: number;
      timeout: number;
    };
  };
}

export interface WsConfigError extends WsBaseResponse {
  command: "config" | "authorize";
  error: string;
}

export interface WsLoginResp extends WsBaseResponse {
  command: "authorize-login";
  info: {
    token: string;
  };
}

export type WsResponse =
  | WsPrioritiesUpdate
  | WsLedStreamUpdate
  | WsConfigGetConfig
  | WsConfigError
  | WsLoginResp