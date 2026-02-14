// src/app/api/precheck/route.ts
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

import {
  PRECHECK_JSON_SCHEMA,
  PRECHECK_SYSTEM_PROMPT,
  buildPrecheckUserPrompt,
  type PrecheckAnswers,
} from "@/lib/precheck";
import { getIPFromHeaders, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type PrecheckBody = {
  answers: PrecheckAnswers;
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Falta OPENAI_API_KEY en .env.local" },
        { status: 500 }
      );
    }

    // Rate limit por IP (en memoria)
    const ip = getIPFromHeaders(req.headers);
    const rl = rateLimit({ key: ip, windowMs: 30_000, max: 4 });

    if (!rl.ok) {
      return NextResponse.json(
        {
          pass: false,
          score: 0,
          summary:
            "Demasiados intentos seguidos. Espera un momento y vuelve a intentar.",
          feedback: [],
          flags: [],
          retryAfterMs: rl.retryAfterMs,
        },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
        }
      );
    }

    const body = (await req.json()) as PrecheckBody;

    const hoursAlone = body?.answers?.hoursAlone?.trim();
    const biteHandling = body?.answers?.biteHandling?.trim();
    const routine = body?.answers?.routine?.trim();

    // ✅ NUEVOS
    const hasPets = body?.answers?.hasPets?.trim();
    const sleepPlace = body?.answers?.sleepPlace?.trim();
    const backupCare = body?.answers?.backupCare?.trim();

    // Validación mínima antes de gastar tokens
    if (
      !hoursAlone ||
      !biteHandling ||
      !routine ||
      !hasPets ||
      !sleepPlace ||
      !backupCare
    ) {
      return NextResponse.json(
        {
          pass: false,
          score: 0,
          summary: "Completa todas las preguntas para poder evaluar.",
          feedback: ["Falta responder una o más preguntas."],
          flags: [],
        },
        { status: 400 }
      );
    }

    const answers: PrecheckAnswers = {
      hoursAlone,
      biteHandling,
      routine,
      hasPets,
      sleepPlace,
      backupCare,
    };

    const res = await client.responses.create({
      model: "gpt-5.2", // ajusta si tu cuenta usa otro id exacto
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: PRECHECK_SYSTEM_PROMPT }],
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: buildPrecheckUserPrompt(answers) },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...PRECHECK_JSON_SCHEMA,
        },
      },
      reasoning: { effort: "medium" },
    });

    const parsed = JSON.parse(res.output_text);

    return NextResponse.json({
      ...parsed,
      remaining: rl.remaining,
      retryAfterMs: 0,
    });
  } catch {
    return NextResponse.json(
      {
        pass: false,
        score: 0,
        summary: "Error evaluando respuestas. Intenta nuevamente.",
        feedback: ["Ocurrió un error inesperado en el servidor."],
        flags: [],
      },
      { status: 500 }
    );
  }
}
