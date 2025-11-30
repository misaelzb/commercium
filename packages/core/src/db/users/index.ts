import { z } from "zod"
import { Drizzle } from "../../shared/drizzle";
import { userTable, type UserTableType } from "./users.sql";
import { eq, or } from "drizzle-orm";
import { password } from "bun";
import { Session } from "../sessions";
import type { DBQueryResponse } from "..";

export namespace User {

    export const InfoSchema = z
        .object({
            id: z.number().openapi({
                description: "ID of the user",
                example: 1
            }),
            firstName: z.string().trim().min(2).max(25).regex(/^[a-zA-Z ]+$/).openapi({
                description: "First name of the user",
                example: "John"
            }),
            lastName: z.string().trim().min(2).max(25).regex(/^[a-zA-Z ]+$/).openapi({
                description: "Last name of the user",
                example: "Doe"
            }),
            username: z.string().min(5).max(25).openapi({
                description: "Username of the user",
                example: "johndoe"
            })
        });

    export type InfoType = z.infer<typeof InfoSchema>
    export const parse = (data: typeof userTable.$inferSelect): InfoType => {
        return {
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
        }
    }

    export const fetch = async (query: number | string, { sensitive }: { sensitive?: boolean } = {}): Promise<InfoType | UserTableType | null> => {
        const user = await Drizzle.db.select().from(userTable).where(
            or(
                eq(typeof query === "string" ? userTable.username : userTable.id, query)
            )
        );
        if (!user[0]) return null;
        if (sensitive) return user[0];
        return parse(user[0]);
    }


    export const LoginSchema = z.object({
        username: z.string().min(5).max(25).openapi({
            description: "Username of the user",
            example: "johndoe"
        }),
        password: z.string().openapi({ // Without length validations
            description: "Password of the user",
            example: "4-S3cr3t-P@ssw0rd"
        })
    });
    export type LoginData = z.infer<typeof LoginSchema>;


    export const CreateSchema = InfoSchema.pick({
        firstName: true,
        lastName: true,
        username: true
    }).extend({
        password: z.string().min(8).max(32).openapi({
            description: "Password of the user",
            example: "4-S3cr3t-P@ssw0rd"
        })
    });
    export type CreateData = z.infer<typeof CreateSchema>;

    export const register = async (data: CreateData): Promise<DBQueryResponse> => {
        const existingUser = await fetch(data.username);
        if (existingUser) return { success: false, errorDetail: "Username is already taken" };

        const hashedPassword = password.hashSync(data.password, "bcrypt");

        const user = await Drizzle.db.insert(userTable).values({
            ...data,
            hashedPassword
        });

        return { success: true }
    };

    export const login = async (data: LoginData): Promise<DBQueryResponse> => {
        const user = await fetch(data.username, { sensitive: true }) as UserTableType;
        if (!user || !password.verifySync(data.password, user.hashedPassword)) return { success: false, errorDetail: "Invalid credentials" };

        let sessionToken = await Session.create(user.id);
        return {
            success: true,
            data: sessionToken
        };
    }   
}