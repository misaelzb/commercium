
export interface ApiResponse<T = any> {
    data?: string | T;
    error?: string;
}

export class HttpResponse {
    public static success<T>(data?: T): ApiResponse<T> {
        return {
            data: data ?? "OK"
        };
    }

    public static error(message: string): ApiResponse<null> {
        return {
            error: message
        };
    }
}