"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, REDUCED } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";

/** Lenis povezan sa gsap.ticker i ScrollTrigger.update. Uz reduced-motion: bez Lenis-a. */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return;

    const lenis = new Lenis({ autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    setLenis(lenis);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    // ScrollTrigger.refresh() posle učitavanja slika i fonta
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });
    document.fonts?.ready.then(refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return null;
}
