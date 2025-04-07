import type { APIRoute } from "astro";
import { OpenAI } from "openai";

export const POST: APIRoute = async ({ request, locals }) => {
  // @ts-ignore
  const openaiApiKey = locals.runtime.env.OPENAI_API_KEY;
  // @ts-ignore
  const openaiSystemPrompt = locals.runtime.env.OPENAI_SYSTEM_PROMPT;
  // @ts-ignore
  const openaiAltSystemPrompt = locals.runtime.env.OPENAI_ALT_SYSTEM_PROMPT;
  // @ts-ignore
  const openaiListOfIdioms = locals.runtime.env.OPENAI_LIST_OF_IDIOMS;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const prompt = body.prompt;

  if (!prompt || typeof prompt !== "string") {
    return new Response("Valid prompt is required", { status: 400 });
  }

  if (prompt.length > 1000) {
    return new Response("Prompt is too long", { status: 400 });
  }

  const primaryContext = [
    { role: "system", content: openaiSystemPrompt },
    { role: "user", content: openaiListOfIdioms },
    { role: "user", content: prompt },
  ];

  const secondaryContext = [
    { role: "system", content: openaiAltSystemPrompt },
    { role: "user", content: prompt },
  ];

  const usePrimaryContext = Math.random() > 0.05;

  const context: any = usePrimaryContext ? primaryContext : secondaryContext;

  const client = new OpenAI({
    apiKey: openaiApiKey,
    timeout: 5000,
  });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: context,
      max_tokens: 40,
    });

    const message = completion.choices[0].message?.content;

    return new Response(
      JSON.stringify({
        response: message,
      })
    );
  } catch (error) {
    console.error("Error communicating with OpenAI API:", error);
    return new Response("Error fetching response from OpenAI API", {
      status: 500,
    });
  }
};
