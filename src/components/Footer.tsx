// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <Link
          href="https://www.facebook.com/blackcrow.web"
          target="_blank"
          rel="noreferrer"
          aria-label="Designed by Black Crow"
          className="group mx-auto flex w-fit items-center gap-7"
        >
          {/* Logo (un poco más grande) */}
          <img
            src="https://res.cloudinary.com/dna3imgfe/image/upload/v1771066973/LogoBlackCrow_grqwcy.png"
            alt="Black Crow"
            className="h-16 w-auto select-none opacity-55 transition duration-300 group-hover:opacity-100"
            draggable={false}
            loading="lazy"
          />

          {/* Textos (más pequeños) */}
          <div className="text-left leading-[1.05]">
            <span className="block text-[10px] tracking-[0.32em] text-white/28 transition duration-300 group-hover:text-white/55">
              DESIGNED BY
            </span>

            <span className="block origin-left text-[12px] font-semibold tracking-[0.28em] text-white/42 transition duration-300 group-hover:scale-[1.07] group-hover:text-white"
            >
              BLACK CROW
            </span>
          </div>
        </Link>
      </div>
    </footer>
  );
}
