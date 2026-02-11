// src/components/HeroEditorial.tsx
"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const DogHead3D = dynamic(() => import("@/components/DogHead3D"), {
  ssr: false,
  loading: () => null,
});

export default function HeroEditorial() {
  const [windowSize, setWindowSize] = useState({ w: 1200, h: 800 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 100 };

  const bgX = useSpring(
    useTransform(mouseX, [0, windowSize.w], [-50, 50]),
    springConfig
  );
  const bgY = useSpring(
    useTransform(mouseY, [0, windowSize.h], [-50, 50]),
    springConfig
  );

  const rafRef = useRef<number | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);

  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });

    const onMouseMove = (e: MouseEvent) => {
      if (!hovering.current) return;
      lastPos.current = { x: e.clientX, y: e.clientY };

      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        mouseX.set(lastPos.current.x);
        mouseY.set(lastPos.current.y);
        rafRef.current = null;
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {
    const t = setTimeout(() => setShow3D(true), 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetch("/model/untitled.glb").catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const scrollToPrecheckGate = () => {
    document.getElementById("precheck-gate")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-[#fbfaf5] font-sans text-[#1a1a1a]"
      onMouseEnter={() => {
        hovering.current = true;
      }}
      onMouseLeave={() => {
        hovering.current = false;
      }}
    >
      {/* 1) FONDO: GRADIENTES LÍQUIDOS */}
      <motion.div
        style={{ x: bgX, y: bgY }}
        className="absolute inset-0 pointer-events-none opacity-80"
      >
        <div className="absolute top-[-10%] left-[-5%] w-[70%] h-[70%] rounded-full blur-[120px] bg-[#ffcfcc]" />
        <div className="absolute top-[10%] right-[-10%] w-[60%] h-[80%] rounded-full blur-[140px] bg-[#d1f7f2]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[50%] h-[60%] rounded-full blur-[110px] bg-[#fff9c4]" />
        <div className="absolute bottom-[0%] left-[0%] w-[50%] h-[50%] rounded-full blur-[130px] bg-[#e8dbff]" />
      </motion.div>

      {/* 2) TEXTO DE FONDO */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none select-none">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.12, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="font-black leading-none uppercase tracking-tighter text-transparent text-[40vw] sm:text-[34vw] md:text-[30vw]"
          style={{ WebkitTextStroke: "2px black" }}
        >
          ADOPT
        </motion.h2>
      </div>

      {/* 3) MARCO EDITORIAL Y TEXTOS */}
      <div className="absolute inset-0 z-40 p-4 sm:p-6 md:p-10 lg:p-12 flex flex-col justify-between pointer-events-none">
        {/* Superior */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="border-l-2 border-black pl-3 sm:pl-4">
            <p className="text-[11px] sm:text-[12px] md:text-[14px] font-black tracking-[0.25em] sm:tracking-[0.3em] uppercase text-black">
              The Rebel Issue
            </p>
            <p className="text-[10px] sm:text-[11px] tracking-[0.08em] sm:tracking-[0.1em] text-black/60 font-medium italic">
              Edición 01 — Lima, Perú
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="bg-black text-white px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter mb-2">
              Buscando Hogar
            </div>
            <span className="text-[36px] sm:text-[44px] md:text-[50px] font-serif leading-none italic opacity-20">
              2026
            </span>
          </div>
        </div>

        {/* Medio */}
        <div className="flex justify-between items-end pb-20 sm:pb-24 md:pb-0">
          {/* Izquierda */}
          <div className="hidden lg:block w-72 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-[11px] font-bold uppercase tracking-widest border-b border-black/10 pb-2 mb-3 text-black/40">
                Vibe Check
              </h3>
              <p className="text-[15px] font-medium leading-relaxed italic text-black/80">
                "Cariñosa por naturaleza, piraña por vocación. Es el balance perfecto entre un abrazo y un mordisquito de amor."
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-[11px] font-bold uppercase tracking-widest border-b border-black/10 pb-2 mb-3 text-black/40">
                Detalles
              </h3>
              <ul className="text-[12px] space-y-1.5 font-bold">
                <li className="flex justify-between border-b border-black/5 pb-1">
                  <span>Género</span> <span className="text-pink-500/70">Hembra</span>
                </li>
                <li className="flex justify-between border-b border-black/5 pb-1">
                  <span>Energía</span> <span>100%</span>
                </li>
                <li className="flex justify-between border-b border-black/5 pb-1">
                  <span>Dientes</span> <span>Muy afilados</span>
                </li>
                <li className="flex justify-between">
                  <span>Nombre</span> <span>Ponle uno :D</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Derecha */}
          <div className="hidden lg:block w-72 text-right space-y-8 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={scrollToPrecheckGate}
                className="group relative px-8 py-4 border-2 border-black overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/5"
              >
                <span className="relative z-10 font-black text-xs uppercase tracking-[0.2em] group-hover:text-white transition-colors duration-300">
                  Adoptar Ahora
                </span>
                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            </motion.div>

            <div className="text-[10px] leading-tight text-black/30 uppercase font-bold tracking-widest">
              Nota editorial:<br />
              Tus tobillos podrían estar en riesgo (pero el amor es ciego).
            </div>
          </div>
        </div>

        {/* Inferior */}
        <div className="flex flex-col items-center">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
            <h2 className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[24px] font-serif italic mb-2 text-black/80 px-2">
              "No tiene nombre, porque espera oír el suyo por primera vez de tu voz."
            </h2>

            <div className="flex items-center gap-3 sm:gap-4 justify-center">
              <div className="h-[1px] w-8 sm:w-12 bg-black/20" />
              <span className="text-[9px] sm:text-[10px] font-black tracking-[0.35em] sm:tracking-[0.4em] uppercase opacity-30">
                Love at first bite
              </span>
              <div className="h-[1px] w-8 sm:w-12 bg-black/20" />
            </div>

            <div className="mt-4 sm:mt-5 lg:hidden pointer-events-auto">
              <button
                onClick={scrollToPrecheckGate}
                className="group relative px-6 sm:px-7 py-3 sm:py-3.5 border-2 border-black overflow-hidden transition-all active:scale-95 shadow-xl shadow-black/5"
              >
                <span className="relative z-10 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] group-hover:text-white transition-colors duration-300">
                  Adoptar Ahora
                </span>
                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4) CENTRO */}
      <div className="relative z-10 flex h-full w-full items-center justify-center pointer-events-none">
        <div className="relative mt-10 sm:mt-12 md:mt-0">
          <div className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-[70px] sm:blur-[80px]" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative z-10 h-[360px] w-[260px] sm:h-[460px] sm:w-[320px] md:h-[620px] md:w-[460px] lg:h-[750px] lg:w-[600px]"
          >
            <Image
              src="/perrita.png"
              alt="Buscando familia"
              fill
              priority
              sizes="(max-width: 640px) 260px, (max-width: 768px) 320px, (max-width: 1024px) 460px, 600px"
              className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.18)]"
            />
          </motion.div>

          <div className="absolute inset-0 z-20">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] sm:h-[650px] sm:w-[650px] md:h-[760px] md:w-[760px] lg:h-[800px] lg:w-[800px]">
              {show3D ? <DogHead3D /> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply z-[60]">
        <Noise />
      </div>

      <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 flex gap-6 sm:gap-8 text-[9px] sm:text-[10px] font-black tracking-widest text-black/20 z-50">
        <span>EST. 2026 — LIMA</span>
      </div>
    </section>
  );
}

function Noise() {
  return (
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <filter id="n-hero">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#n-hero)" />
    </svg>
  );
}
