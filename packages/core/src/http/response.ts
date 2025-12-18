import type { $ZodIssue } from "zod/v4/core";

export type ApiResponse<T = any> = {
    data?: T;
    error?: string;
    zodIssues?: $ZodIssue[];
}
    

 
export namespace HttpResponse {
    export const success = <T = string>(data?: T): ApiResponse<T | string> => {
        return {
            data: data ?? "OK"
        };
    }

    export const error = (message: string, zodIssues?: $ZodIssue[]): ApiResponse => {
        return {
            error: message,
            ...(zodIssues && { zodIssues: zodIssues })
        };
    }

    export const notFound = (): ApiResponse => {
        return {
            error: "Not found"
        };
    }
}