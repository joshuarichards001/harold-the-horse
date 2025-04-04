import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const openaiApiKey = import.meta.env.OPENAI_API_KEY;
  const openaiSystemPrompt = import.meta.env.OPENAI_SYSTEM_PROMPT;

  const body = await request.json();
  const prompt = body.prompt;

  const openaiBody = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: openaiSystemPrompt },
      { role: "user", content: prompt },
    ],
    max_tokens: 100,
  };

  const openaiRequest = new Request(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify(openaiBody),
    }
  );

  const openaiResponse = await fetch(openaiRequest);
  if (!openaiResponse.ok) {
    return new Response("Error fetching response from OpenAI API", {
      status: 500,
    });
  }

  const openaiData = await openaiResponse.json();
  const openaiMessage = openaiData.choices[0].message.content;

  return new Response(
    JSON.stringify({
      response: openaiMessage,
    })
  );
};
