"use client";

import { useMemo, useRef, useState } from "react";
import AdoptionForm from "@/components/AdoptionForm";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";

type Result =
  | {
      pass: true;
      score: number;
      summary: string;
      feedback: string[];
      flags: string[];
      remaining?: number;
      retryAfterMs?: number;
    }
  | {
      pass: false;
      score: number;
      summary: string;
      feedback: string[];
      flags: string[];
      remaining?: number;
      retryAfterMs?: number;
    };

type ToastState = {
  open: boolean;
  title: string;
  description?: string;
  variant?: "info" | "success" | "error";
};

export default function PrecheckGate() {
  const [hoursAlone, setHoursAlone] = useState("");
  const [biteHandling, setBiteHandling] = useState("");
  const [routine, setRoutine] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const toastTimer = useRef<number | null>(null);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    title: "",
    description: "",
    variant: "info",
  });

  const canEvaluate =
    hoursAlone.trim().length > 0 &&
    biteHandling.trim().length >= 10 &&
    routine.trim().length >= 10;

  const missingReason = useMemo(() => {
    const reasons: string[] = [];
    if (!hoursAlone.trim()) reasons.push("elige cuántas horas estaría sola");
    if (biteHandling.trim().length < 10)
      reasons.push("describe mejor el manejo del mordisqueo (mín. 10)");
    if (routine.trim().length < 10) reasons.push("detalla la rutina (mín. 10)");
    return reasons;
  }, [hoursAlone, biteHandling, routine]);

  const prefill = useMemo(
    () => ({ hoursAlone, biteHandling, routine }),
    [hoursAlone, biteHandling, routine]
  );

  function showToast(next: Omit<ToastState, "open">) {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);

    setToast({ open: true, ...next });

    toastTimer.current = window.setTimeout(() => {
      setToast((t) => ({ ...t, open: false }));
    }, 2600);
  }

  async function runPrecheck() {
    if (!canEvaluate) {
      showToast({
        variant: "info",
        title: "Aún no se puede evaluar",
        description: `Falta: ${missingReason.join(" · ")}`,
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setUnlocked(false);

    try {
      const res = await fetch("/api/precheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: prefill }),
      });

      const data = (await res.json()) as Result & { retryAfterMs?: number };

      setResult(data);

      if (res.ok && data.pass) {
        setUnlocked(true);
        showToast({
          variant: "success",
          title: "Desbloqueado",
          description: "Ya puedes completar el formulario de adopción.",
        });
      } else {
        setUnlocked(false);

        if (res.status === 429 && data.retryAfterMs) {
          const seconds = Math.ceil(data.retryAfterMs / 1000);
          showToast({
            variant: "error",
            title: "Demasiados intentos",
            description: `Espera ${seconds}s y vuelve a intentar.`,
          });
        } else {
          showToast({
            variant: "info",
            title: "Aún no",
            description: "Ajusta tus respuestas y prueba otra vez.",
          });
        }
      }
    } catch {
      setResult({
        pass: false,
        score: 0,
        summary: "No se pudo evaluar ahora. Intenta nuevamente.",
        feedback: ["Revisa tu conexión o vuelve a intentar en unos segundos."],
        flags: [],
      });
      setUnlocked(false);
      showToast({
        variant: "error",
        title: "Error",
        description: "No se pudo conectar con el servidor.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative bg-[#fbfaf5] px-4 py-12 sm:px-6 sm:py-14 md:px-12 md:py-16 lg:px-20">
      {/* Toast */}
      <AnimatePresence>
        {toast.open && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[999] w-[min(420px,92vw)]"
          >
            <div className="rounded-2xl border border-black/10 bg-white/85 px-3 py-2.5 sm:px-4 sm:py-3 shadow-[0_25px_70px_rgba(0,0,0,0.12)] backdrop-blur">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <ToastIcon variant={toast.variant} />
                <div className="flex-1">
                  <div className="text-[13px] sm:text-sm font-black text-black/80">
                    {toast.title}
                  </div>
                  {toast.description && (
                    <div className="mt-1 text-[11px] sm:text-xs text-black/60">
                      {toast.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2">
          {/* IZQ: quiz */}
          <div className="rounded-2xl border border-black/10 bg-white/65 p-4 sm:p-5 md:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)] backdrop-blur">
            <div className="space-y-2">
              <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.35em] sm:tracking-[0.4em] text-black/45">
                Pre-check
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-serif italic text-black/85">
                Desbloquea el formulario
              </h3>
              <p className="text-[12px] sm:text-sm text-black/60">
                3 preguntas para asegurar una adopción responsable.
              </p>
            </div>

            <div className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
              <Field label="¿Cuántas horas estaría sola al día?">
                <select
                  value={hoursAlone}
                  onChange={(e) => setHoursAlone(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-sm outline-none focus:border-black/25"
                >
                  <option value="">Selecciona…</option>
                  <option value="0-2">0–2 horas</option>
                  <option value="2-4">2–4 horas</option>
                  <option value="4-6">4–6 horas</option>
                  <option value="6-8">6–8 horas</option>
                  <option value="8+">8+ horas</option>
                </select>
              </Field>

              <Field label="¿Qué harías si muerde jugando? (mín. 10)">
                <textarea
                  value={biteHandling}
                  onChange={(e) => setBiteHandling(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-black/10 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-sm outline-none focus:border-black/25"
                  placeholder="Ej: redirijo a un juguete, refuerzo, y corto el juego unos segundos si insiste…"
                />
              </Field>

              <Field label="¿Rutina de paseos/entrenamiento? (mín. 10)">
                <textarea
                  value={routine}
                  onChange={(e) => setRoutine(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-black/10 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-sm outline-none focus:border-black/25"
                  placeholder="Ej: 2 paseos con olfateo + 10 min entrenamiento + juegos/enriquecimiento…"
                />
              </Field>

              {/* Botón NO deshabilitado: si falta algo, muestra toast */}
              <button
                type="button"
                onClick={runPrecheck}
                aria-disabled={!canEvaluate || loading}
                className={`mt-1 sm:mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full
                  px-5 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] sm:tracking-[0.18em]
                  transition-transform active:scale-95 ${
                    !canEvaluate || loading
                      ? "bg-black/30 text-white/70"
                      : "bg-black text-white hover:scale-[1.01]"
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Evaluando
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Evaluar
                  </>
                )}
              </button>

              {!canEvaluate && (
                <p className="text-[11px] sm:text-xs text-black/45">
                  Escribe un poquito más de detalle para que sea justo.
                </p>
              )}
            </div>
          </div>

          {/* DER: resultado / unlock */}
          <div className="space-y-5 sm:space-y-6">
            {result && (
              <div className="rounded-2xl border border-black/10 bg-white/70 p-4 sm:p-5 md:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.06)] backdrop-blur">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div>
                    <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.35em] sm:tracking-[0.4em] text-black/45">
                      Resultado
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {result.pass ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-500" />
                      )}
                      <h4 className="text-lg sm:text-xl font-black text-black/80">
                        {result.pass ? "Aprobado" : "Aún no"}
                      </h4>
                    </div>
                    <p className="mt-2 text-[12px] sm:text-sm text-black/60">
                      {result.summary}
                    </p>
                  </div>

                  <div className="rounded-full border border-black/10 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] sm:tracking-[0.18em] text-black/60">
                    Score {result.score}
                  </div>
                </div>

                {result.flags?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.flags.map((f) => (
                      <span
                        key={f}
                        className="rounded-full border border-black/10 bg-white px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] sm:tracking-[0.18em] text-black/55"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                <ul className="mt-4 sm:mt-5 space-y-2 text-[12px] sm:text-sm text-black/65">
                  {result.feedback.map((line, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-black/30" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {unlocked ? (
              <AdoptionForm prefill={prefill} />
            ) : (
              <div className="rounded-2xl border border-black/10 bg-white/50 p-4 sm:p-5 md:p-6 text-[12px] sm:text-sm text-black/60">
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.35em] sm:tracking-[0.4em] text-black/45">
                  <Lock className="h-4 w-4" />
                  Formulario
                </div>
                <p className="mt-2">
                  Se desbloquea cuando el pre-check esté aprobado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.32em] sm:tracking-[0.35em] text-black/45">
        {label}
      </div>
      {children}
    </div>
  );
}

function ToastIcon({ variant }: { variant?: "info" | "success" | "error" }) {
  if (variant === "success")
    return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  if (variant === "error")
    return <XCircle className="h-5 w-5 text-rose-500" />;
  return <Info className="h-5 w-5 text-black/60" />;
}
