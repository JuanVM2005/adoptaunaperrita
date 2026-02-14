// src/components/PrecheckGate.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AdoptionForm from "@/components/AdoptionForm";
import PuppyMoodPreview, { type PuppyMood } from "@/components/PuppyMoodPreview";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";

type Result = {
  pass: boolean;
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
  // --- ESTADOS DEL FORMULARIO ---
  const [hoursAlone, setHoursAlone] = useState("");
  const [biteHandling, setBiteHandling] = useState("");
  const [routine, setRoutine] = useState("");
  const [hasPets, setHasPets] = useState("");
  const [sleepPlace, setSleepPlace] = useState("");
  const [backupCare, setBackupCare] = useState("");

  // --- ESTADOS DE LÓGICA Y UI ---
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [mood, setMood] = useState<PuppyMood>("normal");

  // --- LÓGICA DE IA: PUPPY MOOD (TIEMPO REAL) ---
  const liveText = useMemo(() => {
    return `Solo: ${hoursAlone}. Pets: ${hasPets}. Sueño: ${sleepPlace}. Apoyo: ${backupCare}. Mordida: ${biteHandling}. Rutina: ${routine}`.trim();
  }, [hoursAlone, hasPets, sleepPlace, backupCare, biteHandling, routine]);

  const lastReq = useRef(0);

  useEffect(() => {
    if (liveText.length < 15) return;

    const stamp = Date.now();
    lastReq.current = stamp;

    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/mood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: liveText }),
        });

        if (lastReq.current !== stamp) return;
        if (!res.ok) return;

        const data = await res.json();
        if (data?.mood) setMood(data.mood);
      } catch (e) {
        /* Falla silenciosa para no interrumpir la experiencia */
      }
    }, 400);

    return () => clearTimeout(t);
  }, [liveText]);

  // --- VALIDACIÓN Y TOASTS ---
  const toastTimer = useRef<number | null>(null);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    title: "",
    variant: "info",
  });

  const canEvaluate =
    hoursAlone &&
    hasPets &&
    sleepPlace &&
    backupCare &&
    biteHandling.trim().length >= 10 &&
    routine.trim().length >= 10;

  const missingReason = useMemo(() => {
    const reasons: string[] = [];
    if (!hoursAlone) reasons.push("horas sola");
    if (!hasPets) reasons.push("convivencia");
    if (!sleepPlace) reasons.push("lugar de descanso");
    if (!backupCare) reasons.push("cuidados de respaldo");
    if (biteHandling.trim().length < 10) reasons.push("manejo de mordida");
    if (routine.trim().length < 10) reasons.push("rutina diaria");
    return reasons;
  }, [hoursAlone, hasPets, sleepPlace, backupCare, biteHandling, routine]);

  const prefill = {
    hoursAlone,
    biteHandling,
    routine,
    hasPets,
    sleepPlace,
    backupCare,
  };

  function showToast(next: Omit<ToastState, "open">) {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ open: true, ...next });
    toastTimer.current = window.setTimeout(() => {
      setToast((t) => ({ ...t, open: false }));
    }, 3000);
  }

  // --- ACCIÓN: EVALUAR PERFIL ---
  async function runPrecheck() {
    if (!canEvaluate) {
      showToast({
        variant: "info",
        title: "Aún no estamos listos",
        description: `Completa los campos: ${missingReason.join(", ")}`,
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/precheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: prefill }),
      });

      const data = (await res.json()) as Result;
      setResult(data);

      if (res.ok && data.pass) {
        setUnlocked(true);
        showToast({
          variant: "success",
          title: "¡Perfil aprobado!",
          description: "Ya puedes acceder al formulario final.",
        });
      } else {
        setUnlocked(false);
        if (res.status === 429 && data.retryAfterMs) {
          const seconds = Math.ceil(data.retryAfterMs / 1000);
          showToast({
            variant: "error",
            title: "Demasiados intentos",
            description: `Espera ${seconds}s para volver a intentar.`,
          });
        }
      }
    } catch {
      showToast({
        variant: "error",
        title: "Error de red",
        description: "No pudimos conectar con el servidor.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative bg-[#fbfaf5] px-4 py-12 sm:px-6 md:px-12 lg:px-20 min-h-screen">
      {/* Toast Notifier */}
      <AnimatePresence>
        {toast.open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[999] w-[min(420px,90vw)] bg-white/90 backdrop-blur-xl border border-black/10 p-4 rounded-2xl shadow-2xl"
          >
            <div className="flex gap-3">
              <ToastIcon variant={toast.variant} />
              <div className="flex-1">
                <div className="text-sm font-black text-black/80">{toast.title}</div>
                {toast.description && (
                  <div className="text-xs text-black/60 mt-0.5">{toast.description}</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          
          {/* COLUMNA IZQUIERDA: Quiz & Mood */}
          <div className="relative rounded-3xl border border-black/10 bg-white/65 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-md">
            
            {/* Visual AI Feedback */}
            <PuppyMoodPreview mood={mood} />

            <div className="mb-8 mt-4 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">Paso 1: Pre-check</div>
              <h3 className="text-3xl font-serif italic text-black/85 tracking-tight">Cuestionario de compatibilidad</h3>
              <p className="text-sm text-black/50">Cuéntanos sobre tu hogar para conoceros mejor.</p>
            </div>

            <div className="space-y-5">
              <Field label="Tiempo en casa">
                <select
                  value={hoursAlone}
                  onChange={(e) => setHoursAlone(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-black/30 outline-none transition-all"
                >
                  <option value="">¿Cuántas horas pasaría sola al día?</option>
                  <option value="0-2">Muy poco (0–2 horas)</option>
                  <option value="2-4">Poco (2–4 horas)</option>
                  <option value="4-6">Normal (4–6 horas)</option>
                  <option value="6-8">Jornada completa (6–8 horas)</option>
                  <option value="8+">Más de 8 horas</option>
                </select>
              </Field>

              <Field label="Convivencia">
                <select
                  value={hasPets}
                  onChange={(e) => setHasPets(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-black/30 outline-none transition-all"
                >
                  <option value="">¿Convive con otros animales?</option>
                  <option value="no">Es mascota única</option>
                  <option value="1-perro">Sí, con un perro</option>
                  <option value="2+-perros">Sí, con varios perros</option>
                  <option value="gatos">Sí, con gatos</option>
                  <option value="otras">Otros (aves, conejos, etc.)</option>
                </select>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Espacio de descanso">
                  <select
                    value={sleepPlace}
                    onChange={(e) => setSleepPlace(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-black/30 outline-none transition-all"
                  >
                    <option value="">¿Dónde dormiría?</option>
                    <option value="dentro">Dentro de casa</option>
                    <option value="afuera">En el exterior (patio)</option>
                  </select>
                </Field>
                <Field label="Respaldo">
                  <select
                    value={backupCare}
                    onChange={(e) => setBackupCare(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-black/30 outline-none transition-all"
                  >
                    <option value="">¿Quién la cuida si no puedes?</option>
                    <option value="yo">Yo mismo/a</option>
                    <option value="familia">Familiares / Pareja</option>
                    <option value="amigo">Amigos / Vecinos</option>
                    <option value="guarderia">Guardería canina</option>
                  </select>
                </Field>
              </div>

              <Field label="Educación" hint={`${biteHandling.length}/10 mín`}>
                <textarea
                  value={biteHandling}
                  onChange={(e) => setBiteHandling(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-black/30 outline-none transition-all resize-none"
                  placeholder="Si muerde tus manos o ropa jugando, ¿qué harías?"
                />
              </Field>

              <Field label="Rutina ideal" hint={`${routine.length}/10 mín`}>
                <textarea
                  value={routine}
                  onChange={(e) => setRoutine(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-black/30 outline-none transition-all resize-none"
                  placeholder="Describe brevemente sus paseos y actividades diarias..."
                />
              </Field>

              <button
                onClick={runPrecheck}
                disabled={loading}
                className={`w-full py-4 rounded-full font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 ${
                  canEvaluate && !loading
                    ? "bg-black text-white hover:scale-[1.01] active:scale-95"
                    : "bg-black/10 text-black/30 cursor-not-allowed"
                }`}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Analizando perfil..." : "Evaluar mi perfil"}
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA: Resultados & Formulario Final */}
          <div className="space-y-6">
            {result && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-3xl border border-black/10 bg-white p-6 md:p-8 shadow-sm"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">Resultado de IA</div>
                    <div className="flex items-center gap-2">
                      {result.pass ? (
                        <CheckCircle2 className="text-emerald-500 h-6 w-6" />
                      ) : (
                        <XCircle className="text-rose-500 h-6 w-6" />
                      )}
                      <h4 className="font-black text-2xl text-black/80">
                        {result.pass ? "¡Apto!" : "Aún no"}
                      </h4>
                    </div>
                  </div>
                  <div className="bg-black/5 px-4 py-2 rounded-full text-xs font-black">
                    SCORE: {result.score}
                  </div>
                </div>

                <p className="text-sm text-black/60 leading-relaxed mb-6">{result.summary}</p>

                {result.flags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {result.flags.map((flag) => (
                      <span key={flag} className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-100 text-[10px] font-black text-rose-500 uppercase tracking-wider">
                        {flag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-3 border-t border-black/5 pt-6">
                  <div className="text-[10px] font-black uppercase text-black/30 tracking-widest mb-2">Observaciones:</div>
                  {result.feedback.map((item, i) => (
                    <div key={i} className="flex gap-3 text-xs text-black/70 italic">
                      <span className="h-1.5 w-1.5 rounded-full bg-black/20 mt-1.5 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {unlocked ? (
              <AdoptionForm prefill={prefill as any} />
            ) : (
              <div className="rounded-3xl border border-dashed border-black/10 bg-black/[0.02] p-12 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                  <Lock className="h-5 w-5 text-black/20" />
                </div>
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Formulario Final</h5>
                <p className="mt-2 text-sm text-black/40 max-w-[240px] mx-auto">
                  Este paso se desbloqueará una vez que el pre-check sea analizado con éxito.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- SUB-COMPONENTES AUXILIARES ---

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end px-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/45">
          {label}
        </label>
        {hint && (
          <span className={`text-[9px] font-medium uppercase tracking-wider ${
            hint.includes('mín') && parseInt(hint) < 10 ? 'text-black/20' : 'text-emerald-500/60'
          }`}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function ToastIcon({ variant }: { variant?: "info" | "success" | "error" }) {
  if (variant === "success") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (variant === "error") return <XCircle className="h-5 w-5 text-rose-500" />;
  return <Info className="h-5 w-5 text-blue-400" />;
}