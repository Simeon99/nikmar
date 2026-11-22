"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { gsap, ScrollTrigger, useGSAP, DESKTOP, REDUCED } from "@/lib/gsap";
import heroRender from "../../../public/images/heroja-sa-kosara-objekat-2-render.webp";
import styles from "./Hero.module.css";

/** Pin traje 1900 px skrola, širenje okvira 900 px (HomeHeroPrototype). */
const PIN = 1900;
const GROW = 900;

const clamp = (v: number) => Math.max(0, Math.min(1, v));
// easeInOutCubic, isto kao u prototipu
const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

export default function Hero({ cardText }: { cardText: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [dark, setDark] = useState(false);
  const [hold, setHold] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ desktop: DESKTOP, reduce: REDUCED }, (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
        if (!desktop) return; // mobilni: bez pina i bez širenja

        const stage = stageRef.current!;
        const text = textRef.current!;
        const frame = frameRef.current!;
        const img = imgRef.current!;
        const overlay = overlayRef.current!;
        const caption = captionRef.current!;
        const card = cardRef.current!;

        // t: skrol u px od vrha pina; r: otkrivanje okvira na učitavanju (0 do 1)
        const s = { t: 0, r: reduce ? 1 : 0 };
        const IW = heroRender.width;
        const IH = heroRender.height;

        const render = () => {
          const W = stage.clientWidth;
          const H = stage.clientHeight;
          const t = s.t;

          let p = clamp(t / GROW);
          if (reduce) p = p > 0.5 ? 1 : 0;
          const e = easeInOutCubic(p);
          const k = 1 - e;
          const lerp = (a: number, b: number) => a + (b - a) * e;

          // Okvir: top 347 → 0, left početak 5. kolone → 0, right 80 → 0, bottom 0
          const top = 347 * k;
          const left = ((W - 424) / 3 + 176) * k;
          const right = 80 * k;
          const fw = W - left - right;
          const fh = H - top;
          // Maska iz centra okvira na učitavanju
          const mx = (fw * (1 - s.r)) / 2;
          const my = (fh * (1 - s.r)) / 2;
          frame.style.clipPath = `inset(${top + my}px ${right + mx}px ${my}px ${left + mx}px)`;

          // Slika: object-fit contain u polju 4% / 12% / 92% / 88% okvira, poravnata dole.
          // Polje je u rasporedu uvek preko celog ekrana; trenutni okvir se dobija skaliranjem.
          const fitFull = Math.min((0.92 * W) / IW, (0.88 * H) / IH);
          const fitNow = Math.min((0.92 * fw) / IW, (0.88 * fh) / IH);
          const dx = left + fw / 2 - W / 2;
          const scale = (fitNow / fitFull) * lerp(1, 1.04);
          img.style.transform = `translate3d(${dx.toFixed(1)}px, 0, 0) scale(${scale.toFixed(4)})`;

          overlay.style.opacity = e.toFixed(3);

          // Natpis „Vizuelizacija“: top 24 → 100, right 24 → 80 (u odnosu na okvir)
          const capX = 80 - right - lerp(24, 80);
          const capY = top + lerp(24, 100) - 100;
          caption.style.transform = `translate3d(${capX.toFixed(1)}px, ${capY.toFixed(1)}px, 0)`;

          text.style.transform = `translate3d(0, ${(-e * 208).toFixed(1)}px, 0)`;

          // Kartica: ulazi za p 0.6 → 1, nestaje između 1100 i 1500 px
          const cardIn = clamp((p - 0.6) / 0.4);
          const cardOut = clamp(1 - (t - 1100) / 400);
          const c = reduce ? (p >= 1 && t < 1300 ? 1 : 0) : Math.min(cardIn, cardOut);
          card.style.opacity = c.toFixed(3);
          card.style.transform = `translate3d(0, ${((1 - cardIn) * 24).toFixed(1)}px, 0)`;
          card.style.pointerEvents = c > 0.5 ? "auto" : "none";

          // Header je providan dok je ispod njega hero slika (pin + dok slika odlazi)
          setDark(e > 0.85 && t < PIN + H - 76);
        };

        ScrollTrigger.create({
          trigger: stage,
          start: "top top",
          end: `+=${PIN}`,
          pin: true,
          anticipatePin: 1,
        });

        // t je skrol od vrha strane, kao u prototipu (hero je na vrhu)
        ScrollTrigger.create({
          start: 0,
          end: () => PIN + stage.clientHeight,
          onUpdate: (self) => {
            s.t = self.scroll();
            render();
          },
          onRefresh: (self) => {
            s.t = self.scroll();
            render();
          },
        });

        setHold(PIN);
        render();

        if (reduce) {
          gsap.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.inOut" });
        } else {
          // clip-path inset(50%) → inset(0), 0.9s, delay 0.2s, cubic-bezier(0.65,0,0.35,1)
          gsap.to(s, { r: 1, duration: 0.9, delay: 0.2, ease: "power3.inOut", onUpdate: render });
        }

        return () => {
          gsap.set([frame, img, overlay, caption, text, card], {
            clearProps: "clipPath,transform,opacity,pointerEvents",
          });
          setDark(false);
          setHold(0);
        };
      });
    },
    { scope: stageRef }
  );

  return (
    <>
    <Header tone={dark ? "dark" : "light"} hold={hold} />
    <div
      ref={stageRef}
      className="relative overflow-hidden bg-paper pt-[76px] md:h-screen md:min-h-[600px] md:pt-0"
    >

      <section
        ref={textRef}
        aria-label="Uvod"
        className="px-6 pt-16 md:absolute md:inset-x-0 md:top-[76px] md:px-20"
      >
        <span className="nk-label block text-ink-muted">Kruševac · Vrnjačka Banja</span>
        <h1 className="mt-6 mb-0 text-[clamp(48px,13vw,56px)] leading-[1.05] font-extralight tracking-[-0.02em] md:text-[clamp(56px,8vw,128px)]">
          <span className="nk-line">
            <span>
              Prostor za <span className="font-semibold">život.</span>
            </span>
          </span>
        </h1>
        <div className="mt-9 grid grid-cols-1 gap-x-6 md:grid-cols-12">
          <div className="flex flex-col gap-10 md:col-span-4">
            <p className="m-0 max-w-[36ch] text-[20px] leading-[1.5] font-normal text-graphite/80">
              Gradimo stambene zgrade u Kruševcu i Vrnjačkoj Banji. Pet adresa do sada.
            </p>
            <a href="/kontakt" className="nk-ul self-start text-[15px] font-medium max-md:hidden">
              Zakažite razgovor →
            </a>
            <a
              href="/kontakt"
              className="flex h-[52px] items-center justify-center rounded-[2px] border border-signal bg-signal text-[15px] font-medium text-paper transition-[background-color,border-color] duration-300 ease-[ease] hover:border-graphite hover:bg-graphite hover:text-paper md:hidden"
            >
              Zakažite razgovor
            </a>
          </div>
        </div>
      </section>

      <figure
        ref={frameRef}
        className={`${styles.frame} relative z-[1] m-0 mt-10 h-[300px] overflow-hidden bg-graphite md:absolute md:inset-0 md:mt-0 md:h-auto`}
      >
        <Image
          ref={imgRef}
          src={heroRender}
          alt="Vizuelizacija stambene zgrade u ulici Heroja sa Košara u Vrnjačkoj Banji, prizemlje, dva sprata i povučeni sprat."
          sizes="92vw"
          loading="eager"
          fetchPriority="high"
          className="absolute top-[12%] left-[4%] block h-[88%] w-[92%] origin-bottom object-contain object-bottom"
        />
        <div
          ref={overlayRef}
          aria-hidden="true"
          className="absolute inset-0 opacity-0"
          style={{
            background:
              "linear-gradient(0deg, rgba(28,29,32,0.75) 0%, rgba(28,29,32,0) 55%), linear-gradient(90deg, rgba(28,29,32,0.55) 0%, rgba(28,29,32,0) 55%), rgba(28,29,32,0.3)",
          }}
        />
        <figcaption
          ref={captionRef}
          className="absolute top-6 right-6 text-[11px] font-medium tracking-[0.3em] text-paper uppercase md:top-[100px] md:right-20"
        >
          Vizuelizacija
        </figcaption>
      </figure>

      <section
        ref={cardRef}
        aria-label="Izdvojeni projekat: Heroja sa Košara, Objekat 2"
        className={`${styles.card} relative z-[2] flex flex-col gap-[14px] px-6 pt-8 pb-12 md:absolute md:bottom-20 md:left-20 md:max-w-[440px] md:p-0 md:text-paper`}
      >
        <span aria-hidden="true" className="h-px w-12 bg-graphite md:bg-paper" />
        <span className="nk-label text-ink-muted md:text-paper">U izgradnji · Vrnjačka Banja</span>
        <h2 className="m-0 text-[36px] leading-[1.1] font-light md:text-[40px] md:tracking-[-0.01em]">
          Heroja sa <span className="font-semibold">Košara</span>
        </h2>
        <p className="m-0 text-[16px] leading-[1.6] md:text-paper/88">{cardText}</p>
        <a
          href="#u-izgradnji"
          className="nk-ul mt-2 self-start text-[15px] font-medium md:mt-[10px] md:hover:text-mist md:focus-visible:outline-mist"
        >
          Istražite projekat ↗
        </a>
      </section>
    </div>
    </>
  );
}
