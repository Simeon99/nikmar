"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger, useGSAP, REDUCED } from "@/lib/gsap";
import { useInView } from "@/lib/useInView";
import { LINKS } from "@/components/Header";

const PAPER = "#F4F2EE";
const GRAPHITE = "#1C1D20";
const WORDS = ["Razgovor", "počinje", "na", "gradilištu."];

// Fokus na grafitu: mist, 1.5 px (ClosingFooter.dc.html)
const FOCUS = "focus-visible:outline-[1.5px] focus-visible:outline-mist";

export default function Closing() {
  const rootRef = useRef<HTMLElement>(null);
  const [t1Ref, in1] = useInView<HTMLDivElement>(0.35);
  const [t2Ref, in2] = useInView<HTMLDivElement>(0.35);

  // Pozadina prelazi iz paper u graphite dok vrh sekcije ide od dna do polovine ekrana
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ all: "all", reduce: REDUCED }, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean };
        const root = rootRef.current!;
        if (reduce) {
          // Uz reduced-motion: nagla promena na pola puta
          ScrollTrigger.create({
            trigger: root,
            start: "top 75%",
            onEnter: () => gsap.set(root, { backgroundColor: GRAPHITE }),
            onLeaveBack: () => gsap.set(root, { backgroundColor: PAPER }),
            onRefresh: (self) => gsap.set(root, { backgroundColor: self.progress > 0 ? GRAPHITE : PAPER }),
          });
          return;
        }
        gsap.fromTo(
          root,
          { backgroundColor: PAPER },
          {
            backgroundColor: GRAPHITE,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top bottom", end: "top 50%", scrub: true },
          }
        );
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="kontakt"
      aria-label="Razgovor i podnožje"
      className="bg-paper px-6 pt-24 pb-10 text-paper md:px-20 md:pt-40 md:pb-12"
    >
      {/* Naslov ulazi reč po reč (maska odozdo, 0.12s razmak) */}
      <div ref={t1Ref} className="grid grid-cols-1 gap-x-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <span className="nk-label block text-stone">Razgovor</span>
          <h2
            aria-label="Razgovor počinje na gradilištu."
            className="mt-6 mb-0 flex flex-wrap gap-x-[0.25em] text-[clamp(44px,12vw,52px)] leading-[1.05] font-extralight tracking-[-0.02em] md:text-[clamp(56px,7.2vw,120px)]"
          >
            {WORDS.map((w, i) => (
              <span key={w} aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em]">
                <span
                  className="nk7-word inline-block"
                  style={{
                    fontWeight: i === 3 ? 600 : 200,
                    transform: in1 ? "translateY(0)" : "translateY(110%)",
                    transition: `transform .9s cubic-bezier(0.16,1,0.3,1) ${(i * 0.12).toFixed(2)}s`,
                  }}
                >
                  {w}
                </span>
              </span>
            ))}
          </h2>
          <p className="mt-10 mb-0 max-w-[40ch] text-[20px] leading-[1.5] text-paper/80">
            Nemamo klasičnu kancelariju. Na gradilištu je uređen prostor gde sednemo, pogledamo osnove i odgovorimo na pitanja.
          </p>
        </div>
      </div>

      {/* Kontakt */}
      <div ref={t2Ref} className="mt-40 flex max-w-[640px] flex-col">
        <h3 className="m-0 text-[44px] leading-[1.1] font-light tracking-[-0.01em]">
          Javite se <span className="font-semibold">Nikoli.</span>
        </h3>
        <div
          aria-hidden="true"
          className="nk7-line mt-6 h-0.5 origin-left bg-paper"
          style={{
            transform: in2 ? "scaleX(1)" : "scaleX(0)",
            transition: "transform .8s cubic-bezier(0.65,0,0.35,1)",
          }}
        />
        <dl className="mt-12 mb-0 flex flex-col gap-7">
          <div>
            <dt className="text-[12px] font-medium tracking-[0.3em] text-stone uppercase">Vlasnik</dt>
            <dd className="mt-2 ml-0 text-[28px] font-light">
              <span className="nk7-val">Nikola Tomić</span>
            </dd>
          </div>
          <div>
            <dt className="text-[12px] font-medium tracking-[0.3em] text-stone uppercase">Telefon</dt>
            <dd className="mt-2 ml-0 text-[28px] font-light">
              <a className={`nk7-val hover:text-paper ${FOCUS}`} href="tel:+381654184446">
                065/4184 446
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-[12px] font-medium tracking-[0.3em] text-stone uppercase">Mejl</dt>
            {/* Mobilni 22 px da adresa stane u jedan red (dizajn: 28 px, lomi se) */}
            <dd className="mt-2 ml-0 text-[22px] font-light [overflow-wrap:anywhere] md:text-[28px]">
              <a className={`nk7-val hover:text-paper ${FOCUS}`} href="mailto:nikmargradnja037@gmail.com">
                nikmargradnja037@gmail.com
              </a>
            </dd>
          </div>
        </dl>

        {/* Desktop: jedno dugme. Mobilni: „Pozovite“ (svetlo) pa „Zakažite razgovor“ (obris). */}
        <a
          href="/kontakt"
          className={`mt-12 inline-flex h-[52px] items-center self-start rounded-[2px] border border-paper bg-paper px-7 text-[15px] font-medium text-graphite transition-[background-color,color,border-color] duration-300 ease-[ease] hover:border-signal hover:bg-signal hover:text-paper max-md:hidden ${FOCUS}`}
        >
          Zakažite razgovor
        </a>
        <div className="mt-10 flex flex-col gap-3 md:hidden">
          <a
            href="tel:+381654184446"
            className={`flex h-[52px] items-center justify-center rounded-[2px] border border-paper bg-paper text-[15px] font-medium text-graphite transition-[background-color,color,border-color] duration-300 ease-[ease] hover:border-signal hover:bg-signal hover:text-paper ${FOCUS}`}
          >
            Pozovite
          </a>
          <a
            href="/kontakt"
            className={`flex h-[52px] items-center justify-center rounded-[2px] border border-paper/70 text-[15px] font-medium hover:text-paper ${FOCUS}`}
          >
            Zakažite razgovor
          </a>
        </div>
      </div>

      {/* Podnožje */}
      <footer className="mt-[200px]">
        <div className="grid grid-cols-1 items-start gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-0">
          <Link href="/" aria-label="Nikmar gradnja, početna" className={`block justify-self-start ${FOCUS}`}>
            <Image src="/logo/nikmar-logo-belo.png" alt="" width={116} height={104} className="block h-[104px] w-auto" />
          </Link>
          <nav aria-label="Podnožje" className="flex flex-col gap-3 text-[15px]">
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} className={`self-start hover:text-mist ${FOCUS}`}>
                {l.label}
              </a>
            ))}
          </nav>
          <address className="flex flex-col gap-2 text-[14px] leading-[1.5] text-stone not-italic">
            <span>Nikmar gradnja 037 Kruševac</span>
            <span>Rankeova 3, Kruševac</span>
            <span>[PODATAK: MB i PIB]</span>
          </address>
        </div>
        <div className="mt-24 flex flex-col gap-3 text-[13px] text-stone md:flex-row md:justify-between md:gap-0">
          <span>© 2026 Nikmar gradnja</span>
        </div>
      </footer>
    </section>
  );
}
