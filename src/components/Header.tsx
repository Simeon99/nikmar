"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

export const LINKS = [
  { label: "Projekti", href: "/#projekti" },
  { label: "Stanovi", href: "/stanovi" },
  { label: "O nama", href: "/o-nama" },
  { label: "Kontakt", href: "/kontakt" },
];

/** Redosled ulaska stavke kad se header pojavi (--i u globals.css). */
const order = (i: number) => ({ "--i": i }) as CSSProperties;

type Props = {
  /** "dark": providan header preko hero slike (HomeHeroScrolled). */
  tone?: "light" | "dark";
  /** Do ovog skrola (px) header je uvek vidljiv, npr. dok je hero pinovan. */
  hold?: number;
};

/**
 * Fiksiran header: skriva se pri skrolu na dole, pojavljuje se pri skrolu na gore,
 * bilo gde na stranici (DECISIONS.md).
 */
export default function Header({ tone = "light", hold = 0 }: Props) {
  const [hidden, setHidden] = useState(false);
  const dark = tone === "dark";

  useGSAP(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        setHidden(y > hold && self.direction === 1);
      },
    });
    return () => st.kill();
  }, { dependencies: [hold], revertOnUpdate: true });

  // Hover i fokus: signal na svetlom, mist preko slike (HomeHeroScrolled)
  const linkTone = dark
    ? "hover:text-mist focus-visible:outline-mist"
    : "hover:text-signal";

  return (
    <header
      data-hidden={hidden}
      className={`nk-header fixed inset-x-0 top-0 z-50 ${dark ? "bg-paper/0" : "bg-paper"}`}
    >
      <nav
        aria-label="Glavna navigacija"
        className="flex h-[76px] items-center justify-between gap-8 px-6 md:px-20"
      >
        <Link
          href="/"
          aria-label="Nikmar gradnja, početna"
          className={`nk-hitem flex items-center ${linkTone}`}
          style={order(0)}
        >
          {/* Pun logo (desktop): crni i beli se pretapaju */}
          <span className="relative hidden h-14 w-[63px] md:block">
            <Image
              src="/logo/nikmar-logo-crno.png"
              alt=""
              width={61}
              height={56}
              loading="eager"
              className={`absolute top-0 left-0 h-14 w-auto transition-opacity duration-[450ms] ease-[ease] ${
                dark ? "opacity-0" : "opacity-100"
              }`}
            />
            <Image
              src="/logo/nikmar-logo-belo.png"
              alt=""
              width={62}
              height={56}
              loading="eager"
              className={`absolute top-0 left-0 h-14 w-auto transition-opacity duration-[450ms] ease-[ease] ${
                dark ? "opacity-100" : "opacity-0"
              }`}
            />
          </span>
          {/* Znak (mobilni) */}
          <Image
            src="/logo/nikmar-znak.png"
            alt=""
            width={22}
            height={40}
            loading="eager"
            className="block h-10 w-auto md:hidden"
          />
        </Link>

        <div className="flex items-center gap-10">
          <div
            className={`flex items-center gap-10 text-[15px] font-normal transition-colors duration-[450ms] ease-[ease] max-nav:hidden ${
              dark ? "text-paper" : "text-graphite"
            }`}
          >
            {LINKS.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className={`nk-ul nk-hitem ${linkTone}`}
                style={order(i + 1)}
              >
                {l.label}
              </a>
            ))}
          </div>

          <span className="nk-hitem flex max-md:hidden" style={order(LINKS.length + 1)}>
            <a
              href="/kontakt"
              className={`flex h-11 items-center rounded-[2px] border border-signal bg-signal px-6 text-[15px] font-medium whitespace-nowrap text-paper transition-[background-color,border-color] duration-300 ease-[ease] ${
                dark
                  ? "hover:border-paper hover:bg-paper hover:text-graphite focus-visible:outline-mist"
                  : "hover:border-graphite hover:bg-graphite hover:text-paper"
              }`}
            >
              Zakažite razgovor
            </a>
          </span>

          {/* Meni za ekrane do 1000 px. Sam meni još nije dizajniran (DECISIONS.md). */}
          <span className="nk-hitem flex nav:hidden" style={order(1)}>
            <button
              type="button"
              aria-label="Otvori meni"
              className={`flex h-11 w-11 cursor-pointer items-center justify-end border-0 bg-transparent p-0 ${
                dark ? "text-paper focus-visible:outline-mist" : "text-graphite"
              }`}
            >
              <span aria-hidden="true" className="flex w-[26px] flex-col gap-[7px]">
                <span className="h-px bg-current" />
                <span className="h-px bg-current" />
              </span>
            </button>
          </span>
        </div>
      </nav>
    </header>
  );
}
