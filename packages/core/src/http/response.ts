import type { $ZodIssue } from "zod/v4/core";

export type ApiResponse<T = any> = {
  data?: T;
  error?: string;
  zodIssues?: $ZodIssue[];
};

export namespace HttpResponse {
  export const success = <T>(data?: T): ApiResponse<T> => {
    return {
      data: (data ?? "OK") as T,
    };
  };

  export const error = (
    message: string,
    zodIssues?: $ZodIssue[]
  ): ApiResponse => {
    return {
      error: message,
      ...(zodIssues && { zodIssues: zodIssues }),
    };
  };

  export const notFound = (): ApiResponse => {
    return {
      error: "Not found",
    };
  };
}
