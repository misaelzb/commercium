export type DBQueryResponse<T = any> = {
    success: boolean,
    data?: T,
    errorDetail?: string
}