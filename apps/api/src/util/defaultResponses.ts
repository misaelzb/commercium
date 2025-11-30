import { resolver } from "hono-openapi";
import { z } from "zod"

export const ErrorResponses = {
    400: {
        description: "Bad request",
        content: {
            "application/json": {
                schema: resolver(z.object({
                    error: z.string()
                })),
                example: {
                    error: "username: Invalid input: expected string, received undefined",
                }
            }
        }
    }
}