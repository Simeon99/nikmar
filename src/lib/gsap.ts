"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

/** Isti prelom kao u dizajnu: mobilni je do 768 px. */
export const DESKTOP = "(min-width: 769px)";
export const REDUCED = "(prefers-reduced-motion: reduce)";
