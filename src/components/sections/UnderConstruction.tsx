"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, DESKTOP, REDUCED } from "@/lib/gsap";
import { useInView } from "@/lib/useInView";
import type { Construction } from "@/lib/data";
import buildingCutout from "../../../public/images/zgrada-jesen-cutout.png";

// Tekst iz UnderConstruction.dc.html
const PLACES = ["OŠ „Piskavac“", "Aqua Park Raj", "Crkva Svetog Tome", "Fakultet za hotelijerstvo i turizam", "Autobuska stanica"];

const H2 = "m-0 text-[clamp(40px,5vw,80px)] leading-[1.05] font-extralight tracking-[-0.02em]";

type Props = {
  construction: Construction;
  free: number;
  total: number;
  ranges: { label: string; text: string }[];
};

export default function UnderConstruction({ construction, free, total, ranges }: Props) {
  const tlRef = useRef<HTMLDivElement>(null);
  // Posmatra se blok, ne figura: IntersectionObserver uračunava clip-path figure
  const [renderRef, renderIn] = useInView<HTMLDivElement>();
  const [drawRef, drawIn] = useInView<HTMLDivElement>();
  const [placesRef, placesIn] = useInView<HTMLDivElement>();

  // Vremenska linija: desktop scaleX kroz sticky ekran (omotač 200vh), mobilni scaleY bez pina
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: DESKTOP, reduce: REDUCED }, (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
        const wrap = tlRef.current!;
        const line = wrap.querySelector<HTMLElement>(desktop ? "[data-line-x]" : "[data-line-y]")!;
        const prop = desktop ? "scaleX" : "scaleY";

        if (reduce) {
          gsap.set(line, { [prop]: 1 }); // odmah nacrtano
          return;
        }
        gsap.fromTo(
          line,
          { [prop]: 0 },
          {
            [prop]: 1,
            ease: "none",
            scrollTrigger: desktop
              ? { trigger: wrap, start: "top top", end: "bottom bottom", scrub: true }
              : { trigger: wrap, start: "top 80%", end: "top 30%", scrub: true },
          }
        );
      });
    },
    { scope: tlRef }
  );

  const cur = construction.currentPhaseIndex;
  const phases = construction.phases.map((label, i) => {
    const done = i < cur;
    const current = i === cur;
    return {
      label,
      current,
      fill: done ? "#1C1D20" : current ? "#190C9C" : "transparent",
      stroke: done ? "#1C1D20" : current ? "#190C9C" : "#8A8F99",
      color: i > cur ? "#5E626B" : current ? "#190C9C" : "#1C1D20",
      weight: current ? 600 : 500,
    };
  });

  return (
    <section
      id="u-izgradnji"
      aria-label="Šta je sada u izgradnji"
      className="flex flex-col gap-[120px] bg-paper px-6 py-24 text-graphite md:gap-[200px] md:px-20 md:py-40"
    >
      {/* 1. Objekat 2: tekst i render */}
      <div ref={renderRef} className="flex flex-col gap-8 md:grid md:grid-cols-12 md:items-center md:gap-x-6 md:gap-y-0">
        <div className="md:col-span-4">
          <span className="nk-label block text-ink-muted">U izgradnji · Vrnjačka Banja</span>
          <h2 className={`${H2} mt-6`}>
            Zgrada koja <span className="font-semibold">raste.</span>
          </h2>
          <p className="mt-8 mb-0 max-w-[36ch] text-[20px] leading-[1.5]">
            Dve iste zgrade na jednoj parceli, u mirnom stambenom delu Banje. Ukupno 52 stana i 26 parking mesta.
          </p>
        </div>
        <figure
          className="nk5-mask relative m-0 -mx-6 aspect-[16/10] overflow-hidden bg-graphite max-md:order-first md:col-span-8 md:col-start-5 md:mx-0"
          style={{
            clipPath: renderIn ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
            opacity: renderIn ? 1 : 0,
            transition: "clip-path 1s cubic-bezier(0.65,0,0.35,1)",
          }}
        >
          {/* Izrezana fotografija (bez neba) umesto rendera, zahtev korisnika: popunjava okvir na grafitu, poravnata dole */}
          <Image
            src={buildingCutout}
            alt="Stambena zgrada sa terasama i pergolom na vrhu, sa parkingom ispred"
            sizes="(max-width: 768px) 100vw, 66vw"
            className="absolute inset-0 block h-full w-full object-cover object-bottom"
          />
        </figure>
      </div>

      {/* 2. Vremenska linija: desktop sticky kroz jedan ekran, mobilni uspravna bez pina */}
      <div ref={tlRef} className="relative md:h-[200vh]">
        <div className="md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-center">
          <span className="nk-label block text-ink-muted">Objekat 2 · Stanje radova</span>
          <p className="mt-6 mb-0 max-w-[36ch] text-[20px] leading-[1.5]">{construction.statusText}</p>

          {/* Desktop */}
          <div className="mt-[72px] max-md:hidden">
            <div className="relative h-[10px]">
              <div className="absolute inset-x-0 top-1 h-0.5 bg-line-soft" />
              <div data-line-x className="absolute inset-x-0 top-1 h-0.5 origin-left scale-x-0 bg-graphite" />
              <div className="absolute inset-0 grid grid-cols-6">
                {phases.map((f) => (
                  <div key={f.label} className="relative flex justify-center">
                    <span className="relative h-[10px] w-[10px]">
                      {f.current && (
                        <span aria-hidden="true" className="nk5-ring absolute -inset-1.5 rounded-full border border-signal" />
                      )}
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{ background: f.fill, border: `1.5px solid ${f.stroke}` }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <ol className="m-0 mt-6 grid list-none grid-cols-6 p-0">
              {phases.map((f) => (
                <li
                  key={f.label}
                  aria-current={f.current ? "step" : undefined}
                  className="px-2 text-center text-[12px] tracking-[0.2em] uppercase"
                  style={{ fontWeight: f.weight, color: f.color }}
                >
                  {f.label}
                </li>
              ))}
            </ol>
            <div className="mt-12 flex justify-end text-[13px] text-ink-muted">Stanje na dan {construction.statusDate}</div>
          </div>

          {/* Mobilni */}
          <div className="relative mt-12 pl-9 md:hidden">
            <div className="absolute top-1.5 bottom-1.5 left-1 w-0.5 bg-line-soft" />
            <div data-line-y className="absolute top-1.5 bottom-1.5 left-1 w-0.5 origin-top scale-y-0 bg-graphite" />
            <ol className="m-0 list-none p-0">
              {phases.map((f) => (
                <li
                  key={f.label}
                  aria-current={f.current ? "step" : undefined}
                  className="relative py-2.5 text-[12px] tracking-[0.2em] uppercase"
                  style={{ fontWeight: f.weight, color: f.color }}
                >
                  <span
                    className="absolute top-[13px] -left-9 h-[10px] w-[10px] rounded-full"
                    style={{ background: f.fill, border: `1.5px solid ${f.stroke}` }}
                  />
                  {f.label}
                </li>
              ))}
            </ol>
            <div className="mt-6 text-[13px] text-ink-muted">Stanje na dan {construction.statusDate}</div>
          </div>
        </div>
      </div>

      {/* 3. Stanovi */}
      <div className="flex flex-col">
        <h2 className={H2}>
          Birate dok se <span className="font-semibold">gradi.</span>
        </h2>
        <div className="mt-[72px] grid grid-cols-1 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-0">
          {ranges.map((r) => (
            <div key={r.label} className="flex flex-col gap-4">
              <span className="nk-label text-ink-muted">{r.label}</span>
              <span>
                <span className="text-[48px] leading-[1.1] font-extralight tracking-[-0.02em]">{r.text}</span>{" "}
                <span className="text-[24px] font-light">m²</span>
              </span>
            </div>
          ))}
        </div>
        <p className="mt-14 mb-0 text-[20px] leading-[1.5]">
          Slobodno <span className="font-semibold">{free}</span> od {total}
        </p>
        <a
          href="#stanovi"
          className="mt-8 inline-flex h-[52px] items-center rounded-[2px] border border-signal bg-signal px-7 text-[15px] font-medium text-paper transition-[background-color,border-color] duration-300 ease-[ease] hover:border-graphite hover:bg-graphite hover:text-paper max-md:w-full max-md:justify-center md:self-start"
        >
          Pogledajte slobodne stanove
        </a>
      </div>

      {/* 4. Objekat 1 */}
      <div className="flex flex-col gap-8 md:grid md:grid-cols-12 md:items-center md:gap-x-6 md:gap-y-0">
        <div className="md:col-span-4">
          <span className="nk-label block text-ink-muted">Objekat 1 · Druga faza</span>
          <h2 className={`${H2} mt-6`}>
            Druga zgrada tek <span className="font-semibold">počinje.</span>
          </h2>
          <p className="mt-8 mb-0 max-w-[36ch] text-[20px] leading-[1.5]">
            Isti tipovi stanova, preslikan raspored. Radovi kreću u novembru 2026, a stanovi se već biraju iz kataloga.
          </p>
        </div>
        <div ref={drawRef} className="max-md:order-first max-md:max-w-[420px] md:col-span-7 md:col-start-6">
          <svg
            viewBox="0 0 640 400"
            width="100%"
            role="img"
            aria-label="Linijski crtež fasade Objekta 1: prizemlje, dva sprata i povučeni sprat sa pergolom."
            fill="none"
            stroke="#1C1D20"
            strokeWidth={1.5}
            className="block"
          >
            <g
              className="nk5-svg"
              style={{
                strokeDasharray: 1,
                strokeDashoffset: drawIn ? 0 : 1,
                transition: "stroke-dashoffset 1.5s cubic-bezier(0.65,0,0.35,1)",
              }}
            >
              <path pathLength={1} d="M20 380H620" />
              <path pathLength={1} d="M100 380V140H540V380 M100 300H540 M100 220H540" />
              <path pathLength={1} d="M150 140V80H490V140 M100 140V122H150 M490 122H540V140" />
              <path pathLength={1} d="M130 70H510V62H130Z M160 70V62 M190 70V62 M220 70V62 M250 70V62 M280 70V62 M310 70V62 M340 70V62 M370 70V62 M400 70V62 M430 70V62 M460 70V62 M490 70V62" />
              <path pathLength={1} d="M130 318H170V368H130Z M190 318H230V368H190Z M300 312H340V380H300Z M400 318H440V368H400Z M460 318H500V368H460Z" />
              <path pathLength={1} d="M130 236H170V288H130Z M380 236H420V288H380Z M460 236H500V288H460Z M130 156H170V208H130Z M380 156H420V208H380Z M460 156H500V208H460Z M190 92H240V136H190Z M300 92H350V136H300Z M400 92H450V136H400Z" />
              <path pathLength={1} d="M220 300V308H330V300 M220 300V276H330V300 M220 220V228H330V220 M220 220V196H330V220 M240 236H310V276 M240 156H310V196" />
            </g>
          </svg>
        </div>
      </div>

      {/* 5. U blizini: mesta ulaze jedno po jedno (0.1s) */}
      <div ref={placesRef} className="flex flex-col">
        <span className="nk-label block text-ink-muted">U blizini</span>
        <h2 className={`${H2} mt-6`}>
          Banja na <span className="font-semibold">dohvat.</span>
        </h2>
        <ul className="m-0 mt-12 flex list-none flex-col gap-3 p-0 text-[28px] leading-[1.4] font-light md:flex-row md:flex-wrap md:items-baseline md:gap-x-5 md:gap-y-3">
          {PLACES.map((name, i) => (
            <li
              key={name}
              className="nk5-place flex items-baseline gap-5"
              style={{
                opacity: placesIn ? 1 : 0,
                transform: placesIn ? "translateY(0)" : "translateY(12px)",
                transition: `opacity .6s ease ${i * 0.1}s, transform .6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
              }}
            >
              <span>{name}</span>
              {i < PLACES.length - 1 && (
                <span aria-hidden="true" className="text-stone max-md:hidden">
                  ·
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
