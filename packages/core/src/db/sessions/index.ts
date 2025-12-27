import z from "zod";
import crypto from "crypto";
import { sessionsTable } from "./sessions.sql";
import { Drizzle } from "../../shared/drizzle";
import { eq } from "drizzle-orm";
import { User } from "../users";
import { userTable } from "../users/users.sql";

export namespace Session {
  export const SessionSchema = z.object({
    token: z.string(),
    userId: z.number(),
    expires: z.date(),
    createdAt: z.date(),
  });
  export type SessionType = z.infer<typeof SessionSchema>;

  export const create = async (userId: number) => {
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    const token = crypto.randomBytes(32).toString("hex");

    await Drizzle.db.insert(sessionsTable).values({
      token,
      userId,
      expires,
    });

    return token;
  };

  export const getUser = async (
    token: string
  ): Promise<User.InfoType | null> => {
    const [data] = await Drizzle.db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.token, token))
      .leftJoin(userTable, eq(sessionsTable.userId, userTable.id));

    if (!data || !data.sessions || !data.users) return null;
    if (data.sessions.expires < new Date()) {
      await Drizzle.db
        .delete(sessionsTable)
        .where(eq(sessionsTable.token, token));
      return null;
    }
    return User.parse(data.users);
  };

  export const remove = async (token: string) => {
    await Drizzle.db
      .delete(sessionsTable)
      .where(eq(sessionsTable.token, token));
  };
}
