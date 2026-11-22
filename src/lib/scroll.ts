"use client";

import type Lenis from "lenis";
import { REDUCED } from "@/lib/gsap";

let lenis: Lenis | null = null;

/** SmoothScroll prijavljuje svoju Lenis instancu (ili null uz reduced-motion). */
export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/** Skrol do zadate pozicije: preko Lenis-a ako radi, inače nativno. */
export function scrollToY(y: number) {
  if (lenis) {
    lenis.scrollTo(y, { duration: 1.2 });
  } else {
    const reduce = window.matchMedia(REDUCED).matches;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }
}
