import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway.server";

const AssetInput = z.object({
  kind: z.enum(["script", "title", "description", "caption", "hashtag", "cta"]),
  subject: z.string().min(1).max(500),
  brand: z.string().max(120).optional(),
  tone: z.string().max(120).optional(),
  audience: z.string().max(240).optional(),
});

const KIND_INSTRUCTIONS: Record<z.infer<typeof AssetInput>["kind"], string> = {
  script:
    "Write a punchy 60–90 second short-form video script for the topic. Use sections labeled HOOK, BODY (with 3 numbered beats), and CTA. Plain text, no markdown headings, no emojis.",
  title:
    "Write 5 highly clickable video/post titles for the topic. Return a numbered list 1–5. Each 6–12 words. No quotes.",
  description:
    "Write a concise 2–3 sentence description that would sit under a post or video for this topic. Plain text.",
  caption:
    "Write a scroll-stopping social caption for the topic. 2–4 short lines. No hashtags, no emojis, no quotes.",
  hashtag:
    "Return 10–15 relevant hashtags for the topic, space-separated on a single line, each starting with #.",
  cta:
    "Write one strong call to action for the topic. Two short sentences maximum. Plain text.",
};

export const generateAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AssetInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI gateway not configured");
    const gateway = createLovableAiGatewayProvider(key);

    const brand = data.brand?.trim() || "our brand";
    const tone = data.tone?.trim() || "confident, premium, direct";
    const audience = data.audience?.trim() || "founders and creators";

    const system = `You are a senior content strategist writing for ${brand}. Voice: ${tone}. Audience: ${audience}. Never mention that you are an AI. Never wrap output in code fences.`;
    const prompt = `${KIND_INSTRUCTIONS[data.kind]}\n\nTopic: ${data.subject}`;

    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system,
      prompt,
      temperature: 0.8,
    });

    return { body: text.trim() };
  });

const MissionPlanInput = z.object({
  title: z.string().min(1).max(240),
  brand: z.string().max(120).optional(),
});

const PlanSchema = z.object({
  objective: z.string(),
  estimatedMinutes: z.number().int().min(2).max(240),
  apps: z.array(z.string()).max(8),
  steps: z.array(z.object({ title: z.string(), detail: z.string() })).min(3).max(10),
});

export const generateMissionPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MissionPlanInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI gateway not configured");
    const gateway = createLovableAiGatewayProvider(key);

    const system = `You are AnchorSpace's mission planner. Given a user goal, output a strict JSON object matching this TypeScript type:
{ "objective": string, "estimatedMinutes": number, "apps": string[], "steps": { "title": string, "detail": string }[] }
- objective: one sentence describing the outcome
- estimatedMinutes: 5–120
- apps: 2–6 productivity apps that would realistically be used (Notion, Google Docs, YouTube, Gmail, Slack, X, Instagram, LinkedIn, Figma, Google Drive, Google Calendar, Stripe, Buffer)
- steps: 4–8 concrete execution steps. Each step title is 2–6 words, imperative. detail is one sentence.
Return ONLY the JSON, no code fences, no commentary.`;
    const prompt = `Goal: ${data.title}\nBrand: ${data.brand ?? "generic"}`;

    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system,
      prompt,
      temperature: 0.4,
    });

    // Strip potential fences defensively
    const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    let parsed: z.infer<typeof PlanSchema>;
    try {
      parsed = PlanSchema.parse(JSON.parse(cleaned));
    } catch {
      throw new Error("Planner returned invalid JSON");
    }
    return parsed;
  });
