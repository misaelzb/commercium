import type { ApiType } from "@commercium/api";
export type { InferRequestType, InferResponseType } from "hono/client";
import { hc } from 'hono/client';
import { getSessionToken } from "./secureStorage";

export const client = hc<ApiType>(
  "https://me424ikcg7cwcmzdrd4pflmuye0lofuo.lambda-url.us-east-1.on.aws/", {
    fetch: async (input: URL | RequestInfo, init?: RequestInit) => {
      const sessionToken = await getSessionToken();
      const headers = new Headers(init?.headers);
      if (sessionToken) headers.set('Authorization', `Bearer ${sessionToken}`); 
      return await fetch(input, {
        ...init,
        headers
      })
    }
  }
);
