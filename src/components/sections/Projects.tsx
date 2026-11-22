"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP, REDUCED } from "@/lib/gsap";
import { noun, lokal } from "@/lib/plural";
import type { Project } from "@/lib/data";

// Kadriranje slika u kvadratu (vezano za sliku, jer dodela slika projektima nije potvrđena)
const IMAGE_POS: Record<string, string> = {
  "/images/zgrada-jesen-foto.webp": "center 40%",
  "/images/fasada-lokali-cutout.webp": "center bottom",
  "/images/zgrada-sumrak-render.webp": "center 72%",
  "/images/heroja-sa-kosara-objekat-2-render.webp": "center bottom",
};

const unitsText = (p: Project) =>
  `${p.apartments} ${noun(p.apartments)}` +
  (p.commercial ? ` · ${p.commercial} ${lokal(p.commercial)}` : "");

export default function Projects({ projects }: { projects: Project[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Pin i horizontalni skrol rade i na mobilnom (zahtev korisnika, DECISIONS.md).
      // „all“ je uvek tačan: callback se poziva kad je bar jedan uslov ispunjen.
      mm.add({ all: "all", reduce: REDUCED }, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean };

        const stage = stageRef.current!;
        const track = trackRef.current!;
        const imgs = gsap.utils.toArray<HTMLElement>("[data-parallax]", stage);

        // Širina panela zavisi od veličine ekrana (kvadrat), pa se mere čitaju
        // pri svakom refresh-u: širina trake i centri panela u traci.
        let W = 0;
        let D = 0;
        let centers: number[] = [];
        const measure = () => {
          W = document.documentElement.clientWidth;
          D = Math.max(0, track.scrollWidth - W);
          centers = imgs.map((img) => {
            const panel = img.closest("article")!;
            return panel.offsetLeft + panel.offsetWidth / 2;
          });
        };
        measure();

        const render = (progress: number) => {
          const x = progress * D;
          track.style.transform = `translate3d(${(-x).toFixed(1)}px, 0, 0)`;

          // Parallax: ±40 px suprotno od kretanja, po udaljenosti panela od centra ekrana
          imgs.forEach((img, i) => {
            const off = Math.max(-1, Math.min(1, (centers[i] - x - W / 2) / W));
            const shift = reduce ? 0 : off * -40;
            img.style.transform = `translate3d(${shift.toFixed(1)}px, 0, 0)`;
          });
        };

        ScrollTrigger.create({
          trigger: stage,
          start: "top top",
          end: () => {
            measure();
            return `+=${D}`;
          },
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => render(self.progress),
          onRefresh: (self) => render(self.progress),
        });

        return () => {
          gsap.set([track, ...imgs], { clearProps: "transform" });
        };
      });
    },
    { scope: stageRef }
  );

  return (
    <section id="projekti" aria-label="Projekti" className="bg-paper">
      <div
        ref={stageRef}
        className="flex h-svh min-h-[560px] items-center overflow-hidden md:h-screen md:min-h-[600px]"
      >
        <div
          ref={trackRef}
          className="relative flex flex-row items-start gap-6 px-6 will-change-transform md:gap-20 md:px-20"
        >
          <div className="flex w-[calc(100vw_-_48px)] flex-none flex-col gap-7 pt-2 md:w-[420px]">
            <span className="nk-label text-ink-muted">Projekti</span>
            <h2 className="m-0 text-[clamp(48px,5vw,72px)] leading-[1.05] font-extralight tracking-[-0.02em]">
              Pet adresa. <span className="font-semibold">Dva grada.</span>
            </h2>
            <p className="m-0 max-w-[32ch] text-[18px] leading-[1.6] text-graphite/80">
              Tri završena objekta, jedan u izgradnji i jedan u drugoj fazi. Kruševac i Vrnjačka Banja.
            </p>
            <a href="/projekti" className="nk-ul mt-3 self-start text-[15px] font-medium">
              Svi projekti →
            </a>
          </div>

          {projects.map((p, i) => {
            return (
              <article
                key={p.slug}
                className="group flex w-[min(calc(100vw_-_48px),calc(100svh_-_330px))] flex-none flex-col gap-8 md:w-[max(320px,calc(100vh_-_390px))] md:gap-7"
              >
                {/* Kvadratna slika. Mobilni: širina ekrana (ili visina, ako je ekran nizak); desktop: iz visine ekrana */}
                <a
                  href={`/projekti/${p.slug}`}
                  aria-label={`${p.nameLight} ${p.nameBold}, ${p.city} · ${p.statusLabel}`}
                  className={`relative block aspect-square overflow-hidden md:aspect-auto md:h-[max(320px,calc(100vh_-_390px))] ${
                    p.image ? "bg-graphite" : "bg-placeholder"
                  }`}
                >
                  {p.image ? (
                    // Spoljni sloj: hover zoom (ProjectsSection); slika: parallax (prototip)
                    <span className="absolute inset-0 block transition-transform duration-[1.2s] ease-enter group-hover:scale-[1.03] motion-reduce:transition-none">
                      <Image
                        data-parallax={i}
                        src={p.image}
                        alt={p.imageAlt}
                        width={1600}
                        height={1000}
                        sizes="(max-width: 768px) 100vw, 640px"
                        // Sve slike popunjavaju kvadrat (cover), sa 40 px rezerve sa strane za parallax
                        className="absolute top-0 left-[-40px] block h-full w-[calc(100%_+_80px)] max-w-none object-cover"
                        style={{ objectPosition: IMAGE_POS[p.image] ?? "center" }}
                      />
                    </span>
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium tracking-[0.3em] text-ink-muted uppercase">
                      [ Vizuelizacija Objekta 1 ]
                    </span>
                  )}
                  {p.isRender && (
                    <span className="absolute top-5 right-5 text-[11px] font-medium tracking-[0.3em] text-paper uppercase">
                      Vizuelizacija
                    </span>
                  )}
                </a>

                {/* Broj i „Istražite“ u prvom redu, tekst ispod preko cele širine panela */}
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6">
                  <span className="col-start-1 row-start-1 text-[56px] leading-[0.9] font-extralight tracking-[-0.03em] tabular-nums transition-colors duration-500 ease-enter group-hover:text-signal motion-reduce:transition-none">
                    {p.number}
                  </span>
                  <div className="col-span-2 row-start-2 mt-5 flex flex-col gap-3">
                    <span className="nk-label text-ink-muted">
                      {p.city} · {p.statusLabel}
                    </span>
                    <h3 className="m-0 text-[32px] leading-[1.1] font-light tracking-[-0.01em]">
                      {p.nameLight} <span className="font-semibold">{p.nameBold}</span>
                    </h3>
                    <span className="text-[16px] leading-[1.5] text-graphite/80">{unitsText(p)}</span>
                  </div>
                  <span
                    aria-hidden="true"
                    className="nk-ul nk-ul-group col-start-2 row-start-1 mb-1.5 self-end text-[15px] font-medium whitespace-nowrap group-hover:text-signal"
                  >
                    Istražite ↗
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
