
export interface ApiResponse<T = any> {
    data?: any;
    error?: string;
}

export namespace HttpResponse {
    export const success = (data: any): ApiResponse => {
        return {
            data: data ?? "OK"
        };
    }

    export const error = (message: string): ApiResponse => {
        return {
            error: message
        };
    }

    export const notFound = (): ApiResponse => {
        return {
            error: "Not found"
        };
    }
}