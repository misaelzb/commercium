import type { Sales } from "../db/sales";
import type { Store } from "../db/store";
import { Config } from "./config";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

export namespace AiClient {
  export const ai = new GoogleGenAI({ apiKey: Config.GEMINI_API_KEY });
  const ActionSchema = z.object({
    title: z.string().openapi({ example: "Optimize prices" }),
    description: z.string().openapi({ example: "Adjust sale price..." }),
    priority: z.enum(["low", "medium", "high"]).openapi({ example: "high" }),
  });
  export const AiSuggestionSchema = z.object({
    summary: z.string().openapi({
      example: "The store is performing well in terms of revenue...",
    }),
    revenueGrowthActions: z.array(ActionSchema),
    productOptimizationActions: z.array(ActionSchema),
    quickWins: z
      .array(z.string())
      .openapi({ example: ["Create a bundle for..."] }),
  });
  export type AiSuggestionResponse = z.infer<typeof AiSuggestionSchema>;
  export const generateStoreSuggestions = async (
    store: Store.StoreType,
    analytics: Sales.AnalyticsReport
  ): Promise<AiSuggestionResponse> => {
    let prompt = `Analyze the following store data and generate recommendations:
STORE CONTEXT:
- Name: ${store.name}
- Description: ${store.description}

METRICS:
- Avg Daily Customers: ${analytics.avgDailyCustomers}
- Avg Order Value: ${analytics.averageOrderValue} USD
- Monthly Revenue: ${analytics.revenue} USD

PRODUCT PERFORMANCE:
- Top Selling: ${analytics.topProducts.map(p => `${p.info.description} (Cost: ${p.info.costPrice}, Sale: ${p.info.salePrice})`).join(" || ")}
- Low Performing: ${analytics.lowProducts.map(p => `${p.info.description} (Cost: ${p.info.costPrice}, Sale: ${p.info.salePrice})`).join(" || ")}`;

    let systemPrompt = `You are a retail analytics AI specialized in small and medium stores.
Your task is to analyze performance based strictly on provided sales and product data.

RULES:
- Do NOT assume information not provided (location, marketing, etc.).
- Return ONLY valid JSON. 
- Do NOT wrap the response in markdown code blocks (no \`\`\`json).
- Do NOT add any text or explanations outside the JSON object.
- Every array must have between 1 and 3 items.
- When detailing a description about an action, be brief but still detailed, so it's easy to understand
- Avoid exceeding 250 characters when providing a description text for an action.

OUTPUT STRUCTURE:
{
  "summary": "brief performance overview (over 250 characters if needed)",
  "revenueGrowthActions": [{"title": "string", "description": "string", "priority": "low|medium|high"}],
  "productOptimizationActions": [{"title": "string", "description": "string", "priority": "low|medium|high"}],
  "quickWins": ["string"]
}`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: systemPrompt
      }
    });
    if (!response.text) throw new Error("Failed to generate AI response");
    try {
      let data = AiSuggestionSchema.parse(JSON.parse(response.text));
      return data;
    } catch (e) {
      try {
        const cleanedText = response.text
          .replace(/```json\s*|\s*```/g, "")
          .trim();
        return AiSuggestionSchema.parse(JSON.parse(cleanedText));
      } catch (e) {
        throw new Error("Failed to parse AI response");
      }
    } 
  };
}
