import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const STYLE_PROMPTS: Record<string, string> = {
  realistic: "photorealistic, natural lighting, highly detailed, 35mm photo",
  cartoon: "bold clean cartoon illustration, flat vibrant colors, thick outlines",
  watercolor: "soft watercolor painting, paper texture, gentle color bleeds",
  anime: "anime style, cel shading, vivid colors, studio-quality key art",
};

export const generateFromSketch = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        image: z.string().startsWith("data:image/").max(12_000_000),
        prompt: z.string().max(1000).default(""),
        style: z.enum(["realistic", "cartoon", "watercolor", "anime"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI service is not configured.");
    const text = `Turn this sketch into a finished image. Keep the composition and shapes of the sketch. Style: ${STYLE_PROMPTS[data.style]}. ${data.prompt ? `Subject details: ${data.prompt}` : ""}`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image",
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text },
              { type: "image_url", image_url: { url: data.image } },
            ],
          },
        ],
      }),
    });
    if (res.status === 429) throw new Error("Too many requests — wait a moment and try again.");
    if (res.status === 402) throw new Error("AI credits are used up. Add credits to continue.");
    if (!res.ok) throw new Error(`Generation failed (${res.status}).`);
    const json = await res.json();
    const url: string | undefined = json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) throw new Error("The AI didn't return an image. Try a clearer sketch or prompt.");
    return { image: url };
  });
