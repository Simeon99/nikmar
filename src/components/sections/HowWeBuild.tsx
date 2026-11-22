"use client";

import { useRef, useState, type CSSProperties } from "react";
import { gsap, ScrollTrigger, useGSAP, REDUCED } from "@/lib/gsap";
import { scrollToY } from "@/lib/scroll";

// Tekst iz HowWeBuild.dc.html
const TAKTS = [
  { layer: "Zid", label: "Kako gradimo", light: "Od temelja do", bold: "ključa.", text: "Zidane zgrade, sa armirano betonskim serklažima. Bez montažnih zidova i bez prečica." },
  { layer: "Fasada", label: "Fasada", light: "Toplota ostaje", bold: "unutra.", text: "Svaka naša zgrada ima fasadu sa termoizolacijom. Prozori su PVC, sa termoizolacionim staklom." },
  { layer: "Zvuk", label: "Zvuk", light: "Između dva stana,", bold: "tišina.", text: "U Vrnjačkoj Banji zidove između stanova zidamo akustičnim blokom. U Jakšićevoj 14 podovi su plivajući, odvojeni od konstrukcije." },
  { layer: "Pod", label: "Pod", light: "Parket tamo gde se", bold: "živi.", text: "Parket u sobama. Keramika u kupatilu i kuhinji." },
  { layer: "Vreme", label: "Vreme", light: "Jedanaest i po", bold: "meseci.", text: "Toliko je trajalo od prvog dana radova do useljenja u Olimpijskoj 56V." },
];

// Takt se menja na svakih 0.7 visine ekrana; počinje 0.3 ekrana pre pina;
// posle takta 5 (od 3.5 ekrana) je korak 6: nema teksta, crtež ostaje.
const stepFor = (rel: number, h: number) =>
  rel < -0.3 * h ? 0 : rel >= 3.5 * h ? 6 : Math.min(5, Math.floor(Math.max(0, rel) / (0.7 * h)) + 1);

const DRAW = "#AFB6D0"; // mist dok se crta
const DONE = "#F4F2EE"; // paper posle crtanja

export default function HowWeBuild() {
  const rootRef = useRef<HTMLElement>(null);
  const pinStart = useRef(0);
  const [step, setStep] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [reduce, setReduce] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Pin i taktovi rade i na mobilnom (zahtev korisnika, DECISIONS.md)
      // „all“ je uvek tačan: callback se poziva kad je bar jedan uslov ispunjen
      mm.add({ all: "all", reduce: REDUCED }, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean };
        setReduce(reduce);

        const root = rootRef.current!;
        const pin = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: () => `+=${4 * window.innerHeight}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        const update = () => {
          const h = window.innerHeight;
          pinStart.current = pin.start;
          setStep(stepFor(window.scrollY - pin.start, h));
        };

        // Takt se ne scrubuje: samo se računa iz skrola, CSS tranzicije rade ostalo
        ScrollTrigger.create({
          trigger: root,
          start: "top 30%",
          end: () => `+=${3.8 * window.innerHeight}`,
          onUpdate: update,
          onRefresh: update,
          onLeave: update,
          onLeaveBack: update,
        });

        setPinned(true);
        return () => {
          setPinned(false);
          setStep(0);
        };
      });
    },
    { scope: rootRef }
  );

  // Dugme koraka: skrol do sredine odgovarajućeg takta
  const goTo = (n: number) => {
    const h = window.innerHeight;
    scrollToY(pinStart.current + (n - 1) * 0.7 * h + 0.35 * h);
  };

  const layer = (i: number, dur: number): CSSProperties => {
    const on = step >= i;
    return {
      stroke: on ? DONE : DRAW,
      strokeDasharray: 1,
      strokeDashoffset: on ? 0 : 1,
      transition: `stroke-dashoffset ${dur}s cubic-bezier(0.65,0,0.35,1), stroke .5s ease ${dur}s`,
    };
  };
  const late = step >= 5;

  return (
    <section
      ref={rootRef}
      id="kako-gradimo"
      aria-label="Kako gradimo"
      className="relative h-svh min-h-[560px] overflow-hidden bg-graphite px-6 pt-14 pb-4 text-paper md:h-screen md:min-h-[640px] md:px-20 md:pt-24 md:pb-[72px]"
    >
      {/* Mobilni: tekst gore, presek u sredini, koraci dole. Desktop: 12 kolona (dizajn). */}
      <div className="flex h-full flex-col md:grid md:grid-cols-12 md:gap-x-6">
        {/* Levo: taktovi i koraci (na mobilnom „contents“, da presek stane između) */}
        <div className="max-md:contents md:col-span-5 md:col-start-1 md:flex md:flex-col md:justify-between">
          <div className="relative h-[290px] shrink-0 md:h-[460px]">
            {TAKTS.map((k, i) => {
              const n = i + 1;
              const active = n === step;
              return (
                <div
                  key={k.layer}
                  className={`nk-takt absolute inset-x-0 top-0`}
                  aria-hidden={pinned && !active ? true : undefined}
                  style={{
                    opacity: active ? 1 : 0,
                    transform: n < step ? "translateY(-20px)" : active ? "translateY(0)" : "translateY(20px)",
                    transition: "opacity .6s ease, transform .6s cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  <span className="nk-label block text-stone">{k.label}</span>
                  <h2
                    className="mt-4 mb-0 leading-[1.05] font-extralight tracking-[-0.02em] md:mt-6"
                    style={{ fontSize: n === 5 ? "clamp(32px, 3.6vw, 56px)" : "clamp(40px, 5vw, 80px)" }}
                  >
                    {k.light} <span className="font-semibold">{k.bold}</span>
                  </h2>
                  <p className="mt-5 mb-0 max-w-[36ch] text-[18px] leading-[1.5] text-paper/80 md:mt-8 md:text-[20px]">
                    {k.text}
                  </p>
                </div>
              );
            })}
          </div>

          <nav
            aria-label="Koraci"
            className="flex shrink-0 flex-wrap items-center gap-2 text-[12px] font-medium tracking-[0.2em] uppercase max-md:order-3 max-md:justify-between md:gap-[14px] md:tracking-[0.3em]"
          >
            {TAKTS.map((k, i) => (
              <span key={k.layer} className="flex items-center gap-2 md:gap-[14px]">
                <button
                  type="button"
                  onClick={() => goTo(i + 1)}
                  aria-current={step === i + 1 ? "step" : undefined}
                  className="min-h-11 cursor-pointer border-0 bg-transparent p-0 tracking-[inherit] uppercase transition-colors duration-[400ms] ease-[ease] [font:inherit] hover:text-mist focus-visible:outline-mist"
                  style={{ color: step === i + 1 ? "#F4F2EE" : "#8A8F99" }}
                >
                  {k.layer}
                </button>
                {i < TAKTS.length - 1 && (
                  <span aria-hidden="true" className="text-stone">
                    ·
                  </span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Desno: presek zida */}
        <div className="relative flex min-h-0 items-center max-md:order-2 max-md:my-2 max-md:flex-1 md:col-span-6 md:col-start-7">
          <div
            className="absolute inset-x-0 top-0 flex items-baseline gap-3 md:gap-4"
            style={{ opacity: late ? 1 : 0, transition: "opacity .8s ease .6s" }}
          >
            <span className="text-[72px] leading-[0.9] font-extralight tracking-[-0.05em] md:text-[160px]">11,5</span>
            <span className="text-[12px] font-medium tracking-[0.3em] text-stone uppercase">Meseci</span>
          </div>

          <svg
            viewBox="0 0 720 660"
            width="100%"
            role="img"
            aria-label="Crtež preseka zida sa slojevima: blok, termoizolacija, fasada, zid između stanova i pod."
            fill="none"
            strokeWidth={1.5}
            strokeLinecap="square"
            className="block h-full w-full overflow-visible md:h-auto"
          >
            <g className="nk-dim" style={{ opacity: late ? 0.2 : 1, transition: "opacity .8s ease" }}>
              <g className={`nk-l nk-l14`} style={layer(1, 1)}>
                <path pathLength={1} d="M260 120H380V520H260Z" />
                <path pathLength={1} strokeWidth={1} d="M276 520L260 504M292 520L260 488M308 520L260 472M324 520L260 456M340 520L260 440M356 520L260 424M372 520L260 408M380 512L260 392M380 496L260 376M380 480L260 360M380 464L260 344M380 448L260 328M380 432L260 312M380 416L260 296M380 400L260 280M380 384L260 264M380 368L260 248M380 352L260 232M380 336L260 216M380 320L260 200M380 304L260 184M380 288L260 168M380 272L260 152M380 256L260 136M380 240L260 120M380 224L276 120M380 208L292 120M380 192L308 120M380 176L324 120M380 160L340 120M380 144L356 120M380 128L372 120" />
                <path pathLength={1} d="M260 76H380V120H260Z M270 84H370V112H270Z M273 92a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M361 92a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M273 104a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M361 104a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              </g>
              <g className={`nk-l nk-l14`} style={layer(2, 1)}>
                <path pathLength={1} d="M196 76H260V520H196Z M204 76V520" />
                <path pathLength={1} strokeWidth={1} d="M208 76L256 90L208 104L256 118L208 132L256 146L208 160L256 174L208 188L256 202L208 216L256 230L208 244L256 258L208 272L256 286L208 300L256 314L208 328L256 342L208 356L256 370L208 384L256 398L208 412L256 426L208 440L256 454L208 468L256 482L208 496L256 510L208 520" />
                <path pathLength={1} d="M430 120H520V250H430Z M442 132H508V238H442Z M466 132V238 M475 132V238 M484 132V238" />
              </g>
              <g className={`nk-l nk-l14`} style={layer(3, 1)}>
                <path pathLength={1} d="M600 280H660V520H600Z" />
                <path pathLength={1} strokeWidth={1} d="M607 520L600 513M614 520L600 506M621 520L600 499M628 520L600 492M635 520L600 485M642 520L600 478M649 520L600 471M656 520L600 464M660 517L600 457M660 510L600 450M660 503L600 443M660 496L600 436M660 489L600 429M660 482L600 422M660 475L600 415M660 468L600 408M660 461L600 401M660 454L600 394M660 447L600 387M660 440L600 380M660 433L600 373M660 426L600 366M660 419L600 359M660 412L600 352M660 405L600 345M660 398L600 338M660 391L600 331M660 384L600 324M660 377L600 317M660 370L600 310M660 363L600 303M660 356L600 296M660 349L600 289M660 342L600 282M660 335L605 280M660 328L612 280M660 321L619 280M660 314L626 280M660 307L633 280M660 300L640 280M660 293L647 280M660 286L654 280" />
              </g>
              <g className={`nk-l nk-l14`} style={layer(4, 1)}>
                <path pathLength={1} d="M196 520H700V560H196Z" />
                <path pathLength={1} strokeWidth={1} d="M220 548a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M300 548a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M380 548a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M460 548a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M540 548a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M620 548a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path pathLength={1} d="M380 512H600" />
              </g>
            </g>

            {/* Vremenska osa (takt 5) */}
            <g
              className="nk-l nk-l5"
              style={{ ...layer(5, 1.5), ...(reduce ? { opacity: late ? 1 : 0 } : null) }}
            >
              <path pathLength={1} d="M120 600H640" />
              <path pathLength={1} d="M115 600a5 5 0 1 0 10 0a5 5 0 1 0 -10 0 M635 600a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" />
            </g>
            {/* Datumi: desktop 12 px (dizajn); mobilni krupnije jer se crtež skalira na širinu ekrana */}
            {[
              { cls: "max-md:hidden", size: 12, spacing: 3.6, y1: 632, y2: 652 },
              { cls: "md:hidden", size: 22, spacing: 4, y1: 638, y2: 666 },
            ].map((t) => (
              <g
                key={t.cls}
                className={t.cls}
                style={{ opacity: late ? 1 : 0, transition: "opacity .6s ease 1.2s" }}
                fill="#F4F2EE"
                stroke="none"
                fontFamily="var(--font-manrope), sans-serif"
                fontSize={t.size}
                fontWeight={500}
                letterSpacing={t.spacing}
              >
                <text x={112} y={t.y1}>12. 11. 2022.</text>
                <text x={112} y={t.y2} fill="#8A8F99">POČETAK RADOVA</text>
                <text x={648} y={t.y1} textAnchor="end">30. 10. 2023.</text>
                <text x={648} y={t.y2} textAnchor="end" fill="#8A8F99">USELJENJE</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
