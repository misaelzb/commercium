import type { ApiType } from '@commercium/api'
export type { InferRequestType, InferResponseType } from "hono/client";
const { hc } = require("hono/dist/client") as typeof import("hono/client");


export const client = hc<ApiType>('http://10.0.2.2:3001');