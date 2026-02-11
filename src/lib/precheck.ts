// src/lib/precheck.ts

export type PrecheckAnswers = {
    hoursAlone: string;
    biteHandling: string;
    routine: string;
  };
  
  export const PRECHECK_SYSTEM_PROMPT = `
  Eres un evaluador amable para un pre-check de adopción responsable de una perrita joven y enérgica (muerde jugando).
  Objetivo: filtrar impulsivos y educar, NO discriminar por estilo de escritura.
  Devuelve SOLO JSON siguiendo el schema.
  
  Criterios positivos:
  - Habla de entrenamiento positivo, redirección con juguete, refuerzo, paciencia.
  - Rutina realista: paseos, juego, entrenamiento, descanso.
  - Si está sola muchas horas, menciona soluciones (paseador, guardería, familia, enriquecimiento).
  
  Banderas rojas (flags):
  - Castigo físico / violencia / "la golpeo" / "le cierro el hocico" / etc.
  - "La regalo si molesta", "si muerde la boto", "no tengo tiempo".
  - Expectativas irreales: "que no muerda nunca" sin plan.
  
  Regla:
  - Si hay violencia/castigo físico => pass=false (bloquea).
  - Si es solo “inmaduro” o faltan detalles => pass=false pero con feedback educativo y retry.
  `.trim();
  
  export function buildPrecheckUserPrompt(a: PrecheckAnswers) {
    return `
  Respuestas del interesado:
  1) Horas sola al día: ${a.hoursAlone}
  2) ¿Qué harías si muerde jugando?: ${a.biteHandling}
  3) Rutina/tiempo para paseos y entrenamiento: ${a.routine}
  
  Evalúa y devuelve:
  - pass: boolean (si puede desbloquear el formulario)
  - score: 0..100
  - summary: 1 frase
  - feedback: 3-6 bullets concretos
  - flags: 0-4 strings cortos si hay banderas rojas (ej: "castigo físico", "sin tiempo", "expectativas irreales")
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
  