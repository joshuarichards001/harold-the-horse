import type { APIRoute } from "astro";
import { OpenAI } from "openai";

export const POST: APIRoute = async ({ request, locals }) => {
  // @ts-ignore
  const openaiApiKey = locals.runtime.env.OPENAI_API_KEY;
  // @ts-ignore
  const openaiSystemPrompt = locals.runtime.env.OPENAI_SYSTEM_PROMPT;
  // @ts-ignore
  const openaiListOfIdioms = locals.runtime.env.OPENAI_LIST_OF_IDIOMS;

  const body = await request.json();
  const prompt = body.prompt;

  const client = new OpenAI({
    apiKey: openaiApiKey,
  });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: openaiSystemPrompt },
        { role: "user", content: openaiListOfIdioms },
        { role: "user", content: prompt },
      ],
      max_tokens: 100,
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
