"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Info,
  Copy,
  MessageCircle,
} from "lucide-react";

const WHATSAPP_NUMBER = "+51964273326"; // <-- cambia a tu número real (con +51)

type Prefill = {
  hoursAlone: string;
  biteHandling: string;
  routine: string;
};

type ToastState = {
  open: boolean;
  title: string;
  description?: string;
  variant?: "info" | "success" | "error";
};

export default function AdoptionForm({ prefill }: { prefill: Prefill }) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [district, setDistrict] = useState("");
  const [homeType, setHomeType] = useState<"depa" | "casa" | "">("");
  const [hasPets, setHasPets] = useState<"si" | "no" | "">("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  const toastTimer = useRef<number | null>(null);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    title: "",
    description: "",
    variant: "info",
  });

  function showToast(next: Omit<ToastState, "open">) {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);

    setToast({ open: true, ...next });

    toastTimer.current = window.setTimeout(() => {
      setToast((t) => ({ ...t, open: false }));
    }, 2400);
  }

  const compiled = useMemo(() => {
    return `Hola! Quiero adoptar a la perrita

Nombre: ${name || "-"}
WhatsApp: ${whatsapp || "-"}
Distrito/Ciudad: ${district || "-"}
Vivienda: ${homeType || "-"}
¿Otras mascotas?: ${hasPets || "-"}
Mensaje: ${message || "-"}

[Pre-check]
Horas sola al día: ${prefill.hoursAlone}
Si muerde jugando: ${prefill.biteHandling}
Rutina: ${prefill.routine}
`;
  }, [name, whatsapp, district, homeType, hasPets, message, prefill]);

  const waLink = useMemo(() => {
    const num = WHATSAPP_NUMBER.replace(/[^\d]/g, "");
    return `https://wa.me/${num}?text=${encodeURIComponent(compiled)}`;
  }, [compiled]);

  const canSubmit =
    name.trim().length >= 2 &&
    whatsapp.trim().length >= 6 &&
    district.trim().length >= 2 &&
    !!homeType &&
    !!hasPets &&
    consent;

  const missing = useMemo(() => {
    const r: string[] = [];
    if (name.trim().length < 2) r.push("nombre");
    if (whatsapp.trim().length < 6) r.push("WhatsApp");
    if (district.trim().length < 2) r.push("distrito/ciudad");
    if (!homeType) r.push("vivienda");
    if (!hasPets) r.push("mascotas");
    if (!consent) r.push("aceptar seguimiento");
    return r;
  }, [name, whatsapp, district, homeType, hasPets, consent]);

  function openWhatsApp() {
    if (!canSubmit) {
      showToast({
        variant: "info",
        title: "Aún no se puede enviar",
        description: `Falta: ${missing.join(" · ")}`,
      });
      return;
    }
    window.open(waLink, "_blank", "noopener,noreferrer");
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(compiled);
      showToast({
        variant: "success",
        title: "Copiado",
        description: "Listo para pegar donde quieras.",
      });
    } catch {
      showToast({
        variant: "error",
        title: "No se pudo copiar",
        description: "Tu navegador no permitió copiar al portapapeles.",
      });
    }
  }

  return (
    <section className="w-full">
      {/* Toast */}
      <AnimatePresence>
        {toast.open && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-6 right-6 z-[999] w-[min(420px,92vw)]"
          >
            <div className="rounded-2xl border border-black/10 bg-white/85 px-4 py-3 shadow-[0_25px_70px_rgba(0,0,0,0.12)] backdrop-blur">
              <div className="flex items-start gap-3">
                <ToastIcon variant={toast.variant} />
                <div className="flex-1">
                  <div className="text-sm font-black text-black/80">
                    {toast.title}
                  </div>
                  {toast.description && (
                    <div className="mt-1 text-xs text-black/60">
                      {toast.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white/70 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.08)] backdrop-blur">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-serif italic text-black/85">
              Formulario de adopción
            </h3>
            <p className="mt-2 text-sm text-black/60">
              Cortito y sin vueltas. Te contactamos por WhatsApp.
            </p>
          </div>

          <button
            type="button"
            onClick={openWhatsApp}
            className="hidden md:inline-flex items-center justify-center gap-2 rounded-full border-2 border-black px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition-transform hover:scale-[1.03] active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Tu nombre">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25"
              placeholder="Ej: Ana"
            />
          </Field>

          <Field label="Tu WhatsApp">
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25"
              placeholder="Ej: 999 888 777"
            />
          </Field>

          <Field label="Distrito / Ciudad">
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25"
              placeholder="Ej: SJM / Lima"
            />
          </Field>

          <Field label="Vivienda">
            <div className="flex gap-2">
              <Chip
                active={homeType === "depa"}
                onClick={() => setHomeType("depa")}
                text="Depa"
              />
              <Chip
                active={homeType === "casa"}
                onClick={() => setHomeType("casa")}
                text="Casa"
              />
            </div>
          </Field>

          <Field label="¿Tienes otras mascotas?">
            <div className="flex gap-2">
              <Chip active={hasPets === "si"} onClick={() => setHasPets("si")} text="Sí" />
              <Chip active={hasPets === "no"} onClick={() => setHasPets("no")} text="No" />
            </div>
          </Field>

          <Field label="Mensaje (opcional)">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25"
              placeholder="Algo que quieras contar :)"
            />
          </Field>
        </div>

        <label className="mt-5 flex items-start gap-3 text-sm text-black/65">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
          />
          <span>
            Acepto adopción responsable y seguimiento (visita/entrevista si aplica).
          </span>
        </label>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={openWhatsApp}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-xs font-black uppercase tracking-[0.18em] transition-transform active:scale-95 ${
              canSubmit
                ? "bg-black text-white hover:scale-[1.02]"
                : "bg-black/30 text-white/70"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            Enviar por WhatsApp
          </button>

          <button
            type="button"
            onClick={copyMessage}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 px-6 py-4 text-xs font-black uppercase tracking-[0.18em] hover:border-black/30"
          >
            <Copy className="h-4 w-4" />
            Copiar mensaje
          </button>
        </div>

        {!canSubmit && (
          <p className="mt-3 text-xs text-black/45">
            Completa lo básico para enviar (sin spam).
          </p>
        )}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-black uppercase tracking-[0.35em] text-black/45">
        {label}
      </div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  text,
}: {
  active: boolean;
  onClick: () => void;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
        active
          ? "bg-black text-white"
          : "bg-white/80 text-black/65 border border-black/10 hover:border-black/25"
      }`}
    >
      {text}
    </button>
  );
}

function ToastIcon({ variant }: { variant?: "info" | "success" | "error" }) {
  if (variant === "success") return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  if (variant === "error") return <XCircle className="h-5 w-5 text-rose-500" />;
  return <Info className="h-5 w-5 text-black/60" />;
}
