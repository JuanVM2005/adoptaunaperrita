"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Check, Heart, Zap, Bone, Home, Clock } from "lucide-react";

const CARDS = [
  { id: 1, src: "/fotos/foto-de-perrita1.jpeg", angle: -10, x: -42, y: -18 },
  { id: 2, src: "/fotos/foto-de-perrita2.jpeg", angle: -3, x: -16, y: -6 },
  { id: 3, src: "/fotos/foto-de-perrita3.jpeg", angle: 4, x: 12, y: 8 },
  { id: 4, src: "/fotos/foto-de-perrita4.jpeg", angle: 12, x: 40, y: 20 },
];

export default function AdoptionDetails() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /**
   * DERECHA: Control de bloques de texto
   * Usamos 0.5 como punto de quiebre exacto.
   */

  // Bloque 1: visible hasta 45%, luego desaparece
  const opacity1 = useTransform(scrollYProgress, [0, 0.45, 0.5], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.45, 0.5], [0, 0, -20]);

  // Bloque 2: aparece del 0.5 al 0.55 y se queda
  const opacity2 = useTransform(scrollYProgress, [0.5, 0.55, 1], [0, 1, 1]);
  const y2 = useTransform(scrollYProgress, [0.5, 0.55, 1], [20, 0, 0]);

  // Visibilidad + pointer events
  const visibility1 = useTransform(scrollYProgress, (v) =>
    v < 0.5 ? "visible" : "hidden"
  );
  const visibility2 = useTransform(scrollYProgress, (v) =>
    v >= 0.5 ? "visible" : "hidden"
  );
  const pe1 = useTransform(scrollYProgress, (v) => (v < 0.5 ? "auto" : "none"));
  const pe2 = useTransform(scrollYProgress, (v) =>
    v >= 0.5 ? "auto" : "none"
  );

  /**
   * CARTAS: Timing de entrada
   */
  const cardTimings = [0.05, 0.15, 0.25, 0.35];

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-[#fbfaf5]">
      <div className="sticky top-0 h-screen w-full overflow-hidden px-4 sm:px-6 md:px-12 lg:px-20">
        {/* ✅ MISMA ESTRUCTURA EN MOBILE: izquierda/derecha */}
        <div className="flex h-full w-full flex-row items-center gap-4 sm:gap-6 lg:gap-0">
          {/* IZQUIERDA: Baraja / abanico */}
          <div className="relative w-1/2 lg:w-1/2 h-[52vh] sm:h-[56vh] md:h-[60vh] lg:h-full flex items-center justify-center">
            {CARDS.map((card, index) => {
              const start = cardTimings[index];
              const end = start + 0.12;

              const enterY = useTransform(
                scrollYProgress,
                [0, start, end, 1],
                [800, card.y, card.y, card.y]
              );
              const enterRot = useTransform(
                scrollYProgress,
                [0, start, end, 1],
                [25, card.angle, card.angle, card.angle]
              );
              const enterX = useTransform(
                scrollYProgress,
                [0, start, end, 1],
                [0, card.x, card.x, card.x]
              );
              const cardOpacity = useTransform(
                scrollYProgress,
                [0, start, start + 0.05, 1],
                [0, 0, 1, 1]
              );

              return (
                <motion.div
                  key={card.id}
                  style={{
                    y: enterY,
                    x: enterX,
                    rotate: enterRot,
                    opacity: cardOpacity,
                    zIndex: 10 + index,
                    transformOrigin: "50% 80%",
                  }}
                  className="
                    absolute
                    w-[130px] h-[185px]
                    sm:w-[170px] sm:h-[235px]
                    md:w-[230px] md:h-[320px]
                    lg:w-[320px] lg:h-[440px]
                  "
                >
                  <div className="h-full w-full bg-white p-2 sm:p-2.5 md:p-3 shadow-[0_30px_80px_rgba(0,0,0,0.12)] border border-black/5">
                    <div className="relative h-full w-full overflow-hidden bg-gray-100">
                      <Image
                        src={card.src}
                        alt={`Foto ${card.id}`}
                        fill
                        className="object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <div className="pt-2 sm:pt-3 md:pt-4 pb-1 sm:pb-2 text-center">
                      <span className="font-serif italic text-[10px] sm:text-xs md:text-sm text-black/40">
                        Capture 00{card.id}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Sombra más compacta */}
            <div className="pointer-events-none absolute -bottom-8 sm:-bottom-10 h-20 sm:h-24 w-[280px] sm:w-[360px] md:w-[460px] max-w-[90vw] rounded-full bg-black/5 blur-3xl" />
          </div>

          {/* DERECHA: Contenido */}
          <div className="relative w-1/2 lg:w-1/2 h-[52vh] sm:h-[56vh] md:h-[60vh] lg:h-full flex items-center">
            {/* Bloque 1 */}
            <motion.div
              style={{
                opacity: opacity1,
                y: y1,
                visibility: visibility1 as any,
                pointerEvents: pe1 as any,
              }}
              className="absolute inset-0 flex flex-col justify-center space-y-4 sm:space-y-6 md:space-y-8"
            >
              <div className="space-y-1.5 sm:space-y-2">
                <span className="text-[10px] sm:text-xs font-black tracking-[0.35em] sm:tracking-[0.4em] uppercase text-pink-500/60">
                  The Soul
                </span>
                <h2 className="font-serif italic leading-none text-[28px] sm:text-[36px] md:text-5xl lg:text-7xl">
                  ¿Quién es ella?
                </h2>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {["Juguetona", "Mordelona ❤️", "Energía Alta", "Aprende Rápido", "Social"].map(
                  (chip) => (
                    <span
                      key={chip}
                      className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 border border-black/10 rounded-full
                                 text-[10px] sm:text-[11px] md:text-xs font-bold uppercase tracking-wider
                                 bg-white/90 shadow-sm"
                    >
                      {chip}
                    </span>
                  )
                )}
              </div>

              <p className="max-w-[18rem] sm:max-w-[20rem] md:max-w-md text-[12px] sm:text-sm md:text-lg font-medium text-black/70 leading-relaxed italic">
                "Una pequeña terremoto con ojos de ángel. Le encanta ser el centro de
                atención y siempre tiene un juguete en la boca."
              </p>
            </motion.div>

            {/* Bloque 2 */}
            <motion.div
              style={{
                opacity: opacity2,
                y: y2,
                visibility: visibility2 as any,
                pointerEvents: pe2 as any,
              }}
              className="absolute inset-0 flex flex-col justify-center space-y-4 sm:space-y-6 md:space-y-8"
            >
              <div className="space-y-1.5 sm:space-y-2">
                <span className="text-[10px] sm:text-xs font-black tracking-[0.35em] sm:tracking-[0.4em] uppercase text-blue-500/60">
                  Expectativas
                </span>
                <h2 className="font-serif italic leading-none text-[28px] sm:text-[36px] md:text-5xl lg:text-7xl">
                  Lo que necesita
                </h2>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {[
                  { icon: <Zap size={16} />, text: "Familia muy activa" },
                  { icon: <Clock size={16} />, text: "Tiempo para paseos" },
                  { icon: <Heart size={16} />, text: "Paciencia para educar" },
                  { icon: <Home size={16} />, text: "Sin niños muy pequeños" },
                  { icon: <Bone size={16} />, text: "Muchos juguetes" },
                  { icon: <Check size={16} />, text: "Compatible con perros" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 sm:gap-3 group">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black flex items-center justify-center text-white transition-transform group-hover:scale-105">
                      {item.icon}
                    </div>
                    <span className="text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-tight text-black/70">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="p-3 sm:p-4 bg-yellow-50/70 border border-yellow-200/60 rounded-lg max-w-[16rem] sm:max-w-xs md:max-w-sm">
                <p className="text-[10px] sm:text-[11px] font-bold text-yellow-800/60 uppercase tracking-widest leading-tight">
                  Nota: Su nivel de mordida es "Piraña nivel 1", requiere adiestramiento positivo.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
