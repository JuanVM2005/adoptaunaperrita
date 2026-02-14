"use client";

import Image from "next/image";

export type PuppyMood = "normal" | "alegre" | "dudosa" | "molesta";

const SRC: Record<PuppyMood, string> = {
  normal: "/fotos/perrita-normal.png",
  alegre: "/fotos/perrita-alegre.png",
  dudosa: "/fotos/perrita-dudosa.png",
  molesta: "/fotos/perrita-molesta.png",
};

export default function PuppyMoodPreview({ mood }: { mood: PuppyMood }) {
  return (
    <div className="absolute right-6 top-6 z-20">
      <Image
        key={mood}   // 🔥 ESTO ES LA CLAVE
        src={SRC[mood]}
        alt="Perrita mood"
        width={100}
        height={100}
        className="object-contain"
        priority
      />
    </div>
  );
}
