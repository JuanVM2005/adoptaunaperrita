// src/lib/precheck.ts

export type PrecheckAnswers = {
  hoursAlone: string;
  biteHandling: string;
  routine: string;

  // ✅ Nuevas preguntas rápidas (select)
  hasPets: string;
  sleepPlace: string;
  backupCare: string;
};

export const PRECHECK_SYSTEM_PROMPT = `
Eres un evaluador amable para un pre-check de adopción responsable de una perrita joven y enérgica (muerde jugando).
Objetivo: filtrar impulsivos y educar, NO discriminar por estilo de escritura.
Devuelve SOLO JSON siguiendo el schema.

Criterios positivos:
- Habla de entrenamiento positivo, redirección con juguete, refuerzo y paciencia.
- Rutina realista: paseos, juego, entrenamiento y descanso.
- Si está sola varias horas, menciona soluciones (paseador, familia, enriquecimiento).
- Si hay otras mascotas, sugiere adaptación progresiva, supervisión y presentación lenta.
- Tener red de apoyo suma (familia/pareja/amigos/guardería).
- Dormir dentro de casa o tener un espacio dentro suma (vínculo y bienestar).

Banderas rojas (flags):
- Castigo físico / violencia / "la golpeo" / "le cierro el hocico" / etc.
- "La regalo si molesta", "si muerde la boto", "no tengo tiempo".
- Expectativas irreales: "que no muerda nunca" sin plan.
- Dormirá permanentemente afuera sin interacción y sin plan de bienestar.
- Trabaja muchas horas y no tiene red de apoyo ni soluciones.

Regla:
- Si hay violencia/castigo físico => pass=false (bloquea).
- Si es inmaduro o faltan detalles => pass=false pero con feedback educativo.
`.trim();

export function buildPrecheckUserPrompt(a: PrecheckAnswers) {
  return `
Respuestas del interesado:
1) Horas sola al día: ${a.hoursAlone}
2) ¿Qué harías si muerde jugando?: ${a.biteHandling}
3) Rutina/tiempo para paseos y entrenamiento: ${a.routine}
4) ¿Tienes otras mascotas?: ${a.hasPets}
5) ¿Dónde dormiría la perrita?: ${a.sleepPlace}
6) Si un día no puedes, ¿quién la cuida?: ${a.backupCare}

Evalúa y devuelve:
- pass: boolean (si puede desbloquear el formulario)
- score: 0..100
- summary: 1 frase
- feedback: 3-6 bullets concretos
- flags: 0-4 strings cortos si hay banderas rojas (ej: "castigo físico", "sin tiempo", "afuera sin plan", "sin red de apoyo")
`.trim();
}

export const PRECHECK_JSON_SCHEMA = {
  name: "adoption_precheck",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      pass: { type: "boolean" },
      score: { type: "integer", minimum: 0, maximum: 100 },
      summary: { type: "string" },
      feedback: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: { type: "string" },
      },
      flags: {
        type: "array",
        minItems: 0,
        maxItems: 4,
        items: { type: "string" },
      },
    },
    required: ["pass", "score", "summary", "feedback", "flags"],
  },
} as const;
