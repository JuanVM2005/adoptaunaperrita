import { NextResponse } from "next/server";

export type PuppyMood = "normal" | "alegre" | "dudosa" | "molesta";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 5) {
      return NextResponse.json({ mood: "normal" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: `
Eres un clasificador emocional para un formulario de adopción de una perrita.

Debes clasificar el texto en SOLO uno de estos labels:
normal, alegre, dudosa, molesta.

Reglas:

- Tiende a clasificar como "alegre" si detectas intención positiva,
  cariño, responsabilidad, disposición o buena actitud.
  Aunque no sea extremadamente emocional.

- Usa "dudosa" si detectas inseguridad, indecisión,
  frases como "no sé", "tal vez", "creo que", "no estoy seguro".

- Usa "molesta" SOLO si hay enojo claro, frustración fuerte,
  agresividad, desinterés evidente o actitud negativa marcada.

- Si el texto es neutro sin emoción clara, clasifícalo como "normal".

Responde SOLO con el label exacto.
Sin comillas.
Sin explicación.
`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.2,
        max_output_tokens: 20,
      }),
    });

    if (!response.ok) {
      console.log("OpenAI error:", await response.text());
      return NextResponse.json({ mood: "normal" });
    }

    const data = await response.json();

    const output =
      data.output?.[0]?.content?.[0]?.text?.trim().toLowerCase() || "normal";

    const allowed: PuppyMood[] = [
      "normal",
      "alegre",
      "dudosa",
      "molesta",
    ];

    const mood = allowed.includes(output as PuppyMood)
      ? (output as PuppyMood)
      : "normal";

    return NextResponse.json({ mood });
  } catch (error) {
    console.log("Mood route error:", error);
    return NextResponse.json({ mood: "normal" });
  }
}
