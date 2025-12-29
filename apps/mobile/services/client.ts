import type { ApiType } from "@commercium/api";
export type { InferRequestType, InferResponseType } from "hono/client";
import { hc } from 'hono/client';

export const client = hc<ApiType>(
  "https://me424ikcg7cwcmzdrd4pflmuye0lofuo.lambda-url.us-east-1.on.aws/"
);
