import { and, eq } from "drizzle-orm";
import type { DBQueryResponse } from "..";
import { AiClient } from "../../shared/ai";
import { Drizzle } from "../../shared/drizzle";
import { aiResponsesTable } from "./ai-responses.sql";
import z from "zod";
import { dateValue } from "../../util/specialTypes";

export namespace Ai {
  export const AiGeneratedDataSchema = z.object({
    response: AiClient.AiSuggestionSchema,
    label: z.string(),
    isFromDb: z.boolean(),
    createdAt: dateValue(),
  });

  export type AiGeneratedData = z.infer<typeof AiGeneratedDataSchema>;

  export const saveAiSuggestions = async (
    storeId: number,
    data: AiClient.AiSuggestionResponse
  ): Promise<DBQueryResponse<string>> => {
    const stringifiedResponse = JSON.stringify(data);

    const [exists] = await Drizzle.db
      .select({ id: aiResponsesTable.id })
      .from(aiResponsesTable)
      .where(
        and(
          eq(aiResponsesTable.storeId, storeId),
          eq(aiResponsesTable.label, "suggestions")
        )
      );

    if (exists) {
      await Drizzle.db
        .update(aiResponsesTable)
        .set({ response: stringifiedResponse })
        .where(
          eq(aiResponsesTable.id, exists.id)
        );
    } else {
      await Drizzle.db.insert(aiResponsesTable).values({
        storeId,
        label: "suggestions",
        response: stringifiedResponse,
      });
    }

    return { success: true, data: "OK" };
  };

  export const fetchLastSuggestions = async (
    storeId: number
  ): Promise<AiGeneratedData | null> => {
    const [suggestion] = await Drizzle.db
      .select()
      .from(aiResponsesTable)
      .where(
        and(
          eq(aiResponsesTable.storeId, storeId),
          eq(aiResponsesTable.label, "suggestions")
        )
      )
      .limit(1);

    if (!suggestion) return null;

    return {
      response: JSON.parse(suggestion.response),
      isFromDb: true,
      label: "suggestions",
      createdAt: suggestion.createdAt,
    };
  };
}