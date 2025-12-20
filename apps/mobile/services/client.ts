import type { ApiType } from "@commercium/api";
import { Platform } from "react-native";
export type { InferRequestType, InferResponseType } from "hono/client";
const { hc } = require("hono/dist/client") as typeof import("hono/client");

export const client = hc<ApiType>(
  Platform.OS == "web" ? "http://localhost:3001" : "http://10.0.2.2:3001"
);
