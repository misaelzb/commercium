import { HttpResponse, HttpStatus } from "@commercium/core";
import type { Context, Env } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import type { $ZodError } from "zod/v4/core";


export const handleInvalidBody = (zodError: $ZodError, c: Context<Env, string, {}>) => {
    c.status(HttpStatus.BAD_REQUEST as StatusCode);
    return c.json(HttpResponse.error(zodError.issues[0]!.path[0]?.toString() + ": " + zodError.issues[0]!.message, zodError.issues));
}