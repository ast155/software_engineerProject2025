"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <nav
      className="
        relative w-full py-7 px-10 flex items-center justify-center
        backdrop-blur-2xl border-b border-white/20 shadow-2xl overflow-hidden
      "
    >

      {/* Fondo animado con ondas de colores */}
      <div
        className="
          absolute inset-0 -z-10 opacity-90
          bg-gradient-wave
          animate-colorWave
        "
      />

      {/* Label pequeño superior */}
      <span className="absolute left-6 top-3 text-[11px] text-gray-200 tracking-[0.15em] uppercase select-none">
        Made by Rutgers Students
      </span>

      {/* Título luxury */}
      <Link
        href="/"
        className="
          font-extrabold text-5xl text-white tracking-[0.25em]
          transition-all duration-500 ease-out
          drop-shadow-[0_0_25px_rgba(255,255,255,0.35)]

          hover:scale-110 
          hover:tracking-[0.35em]
          hover:drop-shadow-[0_0_50px_rgba(255,255,255,0.75)]
        "
        style={{ fontFamily: "serif" }}
      >
        𝑬𝒗𝒆𝒏𝒕𝑨𝒑𝒑
      </Link>

      {/* Menú derecho */}
      <div className="absolute right-10 flex gap-10 items-center">
        <Link
          href="/planner"
          className="
            text-gray-200 text-xl transition-all duration-300
            hover:text-white hover:tracking-wide
          "
        >
          Planner
        </Link>

        <Link
          href="/account"
          className="
            text-gray-200 text-xl transition-all duration-300
            hover:text-white hover:tracking-wide
          "
        >
          Account
        </Link>
      </div>
    </nav>
  );
}







