"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/useInView";
import { scrollToY } from "@/lib/scroll";
import { DESKTOP, REDUCED } from "@/lib/gsap";
import { countText, noun, plural } from "@/lib/plural";
import type { Apartment, BuildingWithFloors, Floor } from "@/lib/data";

// Zone spratova preko crteža, u procentima (FindApartment.dc.html), odozdo nagore
const ZONES = [
  { x: "15.6%", y: "75%", w: "68.8%", h: "20%", labelY: "85%" },
  { x: "15.6%", y: "55%", w: "68.8%", h: "20%", labelY: "65%" },
  { x: "15.6%", y: "35%", w: "68.8%", h: "20%", labelY: "45%" },
  { x: "23.4%", y: "20%", w: "53.2%", h: "15%", labelY: "27.5%" },
];

// Crtež zgrade, jedna putanja po spratu (odozdo nagore)
const FLOOR_PATHS = [
  "M20 380H620 M100 380V300 M540 380V300 M100 300H540 M130 318H170V368H130Z M190 318H230V368H190Z M300 312H340V380H300Z M400 318H440V368H400Z M460 318H500V368H460Z",
  "M100 300V220 M540 300V220 M100 220H540 M130 236H170V288H130Z M380 236H420V288H380Z M460 236H500V288H460Z M220 300V308H330V300 M220 300V276H330V300 M240 236H310V276",
  "M100 220V140 M540 220V140 M100 140H540 M130 156H170V208H130Z M380 156H420V208H380Z M460 156H500V208H460Z M220 220V228H330V220 M220 220V196H330V220 M240 156H310V196",
  "M150 140V80H490V140 M100 140V122H150 M490 122H540V140 M130 70H510V62H130Z M190 92H240V136H190Z M300 92H350V136H300Z M400 92H450V136H400Z M190 70V62 M250 70V62 M310 70V62 M370 70V62 M430 70V62",
];

const HATCH = "repeating-linear-gradient(45deg, rgba(138,143,153,0.55) 0 1px, transparent 1px 8px)";
const FOCUS = "focus-visible:outline-[1.5px] focus-visible:outline-offset-[3px]";

const freeOf = (f: Floor) => f.units.filter((u) => u.status === "available").length;

/** Sprat sa najviše slobodnih stanova (kod jednakih, niži sprat) */
const defaultFloor = (b: BuildingWithFloors) =>
  b.floors.reduce((best, f, i) => (freeOf(f) > freeOf(b.floors[best]) ? i : best), 0);

/** Kratak talas oko izabranog sprata (0.6s). Uz reduced-motion se preskače. */
function ping(el?: HTMLElement) {
  if (!el || window.matchMedia(REDUCED).matches) return;
  el.animate(
    [{ boxShadow: "0 0 0 0 rgba(25,12,156,0.45)" }, { boxShadow: "0 0 0 12px rgba(25,12,156,0)" }],
    { duration: 600, easing: "cubic-bezier(0.16,1,0.3,1)" }
  );
}

/** Naslov liste sa linijom koja se iscrta pri svakom novom izboru */
function ListTitle({ text, drawn, className = "" }: { text: string; drawn: boolean; className?: string }) {
  return (
    <div className={className}>
      {text}
      <span
        aria-hidden="true"
        className="mt-3 block h-0.5 w-12 origin-left bg-signal"
        style={{
          transform: drawn ? "scaleX(1)" : "scaleX(0)",
          transition: drawn ? "transform .6s cubic-bezier(0.65,0,0.35,1) .1s" : "none",
        }}
      />
    </div>
  );
}

// Cena: u podacima je za sada uvek null. Format sa valutom se određuje kad stignu prave cene.
const priceText = (u: Apartment) => (u.price == null ? "Cena na upit" : u.price.toLocaleString("sr-RS"));

type Row = {
  key: string;
  label: string;
  struct: string;
  orient: string;
  mobLine: string;
  available: boolean;
  href: string;
  price: string;
};

export default function FindApartment({ buildings }: { buildings: BuildingWithFloors[] }) {
  const [bId, setBId] = useState(buildings[0]?.id);
  // Po defaultu je izabran sprat sa najviše slobodnih stanova (DECISIONS.md)
  const [fSel, setFSel] = useState<number | null>(() => (buildings[0] ? defaultFloor(buildings[0]) : null));
  const [hov, setHov] = useState<number | null>(null);
  const [rowsIn, setRowsIn] = useState(true);
  const [listOpen, setListOpen] = useState(true);
  const [drawRef, drawn] = useInView<HTMLDivElement>(0.3);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scrollPending = useRef(false);
  const titleDesk = useRef<HTMLDivElement>(null);
  const titleMob = useRef<HTMLDivElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Promena izbora: lista se zatvori i ponovo otvori, redovi ulaze iznova
  const replay = (apply: () => void) => {
    apply();
    setRowsIn(false);
    setListOpen(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setRowsIn(true);
      setListOpen(true);
    }, 30);
  };

  const B = buildings.find((b) => b.id === bId) ?? buildings[0];
  const fl = fSel != null ? B.floors[fSel] : null;
  const soldOut = !!fl && freeOf(fl) === 0;
  const step = fSel != null ? 3 : 2;
  // Redovi i linija ulaze tek kad sekcija (crtež) uđe u ekran
  const rowsVisible = rowsIn && drawn;

  const rows: Row[] = fl
    ? [...fl.units]
        .sort((a, b) => (a.status === b.status ? a.number - b.number : a.status === "available" ? -1 : 1))
        .map((u) => {
          const struct = `${u.structure}, ${u.areaM2} m²`;
          const orient = B.hasOrientation && u.orientation ? u.orientation : "";
          return {
            key: `${u.building}-${u.number}`,
            label: `Stan ${String(u.number).padStart(2, "0")}`,
            struct,
            orient,
            mobLine: struct + (orient ? ` · ${orient}` : ""),
            available: u.status === "available",
            href: `/stanovi/${u.building}/${u.number}`,
            price: priceText(u),
          };
        })
    : [];

  const cols = B.hasOrientation
    ? "120px minmax(0,1.4fr) minmax(0,1fr) 150px 140px minmax(150px,auto)"
    : "120px minmax(0,2.4fr) 150px 140px minmax(150px,auto)";

  // Izbor sprata: talas oko kliknutog elementa i blagi skrol do liste (ako se lista ne vidi)
  const goFloor = (i: number, from?: HTMLElement) => {
    ping(from);
    scrollPending.current = true;
    replay(() => setFSel(Math.max(0, Math.min(B.floors.length - 1, i))));
  };

  useEffect(() => {
    if (!scrollPending.current) return;
    scrollPending.current = false;
    if (fSel == null) return;
    // Vidljiv naslov liste (desktop ili mobilni)
    const el = [titleDesk.current, titleMob.current].find((e) => e && e.offsetParent !== null);
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top > 90 && top < window.innerHeight * 0.6) return; // lista se već vidi
    // Mobilni: naslov odmah ispod headera (76 px). Desktop: na 40% ekrana, da crtež ostane delom vidljiv.
    const target = window.matchMedia(DESKTOP).matches ? window.innerHeight * 0.4 : 110;
    scrollToY(window.scrollY + top - target);
  }, [fSel]);

  return (
    <section id="stanovi" aria-label="Pronađite svoj stan" className="bg-paper px-6 pb-24 text-graphite md:px-20 md:pb-40">
      <div aria-hidden="true" className="h-px bg-stone" />

      <div className="mt-10 flex flex-col gap-10 md:mt-40 md:grid md:grid-cols-12 md:items-start md:gap-x-6 md:gap-y-0">
        {/* Levo: naslov i izbor zgrade */}
        <div className="flex flex-col md:col-span-4">
          <span className="nk-label text-ink-muted">Pronađite svoj stan</span>
          <h2 className="mt-6 mb-0 text-[clamp(40px,5vw,80px)] leading-[1.05] font-extralight tracking-[-0.02em]">
            Zgrada. Sprat. <span className="font-semibold">Stan.</span>
          </h2>
          <p className="mt-8 mb-0 max-w-[36ch] text-[20px] leading-[1.5]">
            Izaberite zgradu, pa sprat. Za svaki stan vidite strukturu, kvadraturu, strane sveta i da li je dostupan.
          </p>
          <MobileStep n={1} text="Zgrada" active={false} className="mt-12" />
          <div role="group" aria-label="Zgrada" className="mt-14 flex flex-col gap-2 max-md:mt-4">
            {buildings.map((b) => {
              const sel = b.id === B.id;
              const n = b.floors.reduce((s, f) => s + freeOf(f), 0);
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={sel}
                  onClick={() =>
                    replay(() => {
                      setBId(b.id);
                      setFSel(defaultFloor(b));
                    })
                  }
                  className={`flex min-h-16 cursor-pointer flex-col gap-1 border-0 border-b-2 bg-transparent py-3.5 text-left [font:inherit] text-inherit ${FOCUS} ${
                    sel ? "border-signal" : "border-line"
                  }`}
                >
                  <span className="text-[17px]" style={{ fontWeight: sel ? 600 : 400 }}>
                    {b.name}
                  </span>
                  <span className="text-[14px] text-ink-muted">{countText(n)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desno: koraci i crtež sa spratovima */}
        <div className="flex flex-col gap-6 max-md:gap-4 md:col-span-7 md:col-start-6">
          <MobileStep n={2} text="Sprat" active={step === 2} />
          <div className="flex gap-[14px] text-[12px] font-medium tracking-[0.3em] uppercase max-md:hidden">
            <span className="text-ink-muted">1 Zgrada</span>
            <span aria-hidden="true" className="text-stone">·</span>
            <span className={step === 2 ? "text-graphite" : "text-ink-muted"}>2 Sprat</span>
            <span aria-hidden="true" className="text-stone">·</span>
            <span className={step === 3 ? "text-graphite" : "text-ink-muted"}>3 Stan</span>
          </div>

          <div ref={drawRef} className="relative">
            <svg
              viewBox="0 0 640 400"
              width="100%"
              role="img"
              aria-label="Linijski crtež zgrade po spratovima, sa označenim dostupnim stanovima."
              fill="none"
              stroke="#1C1D20"
              strokeWidth={1.5}
              className="block"
            >
              {/* Iscrtava se sprat po sprat odozdo, 0.3s po spratu */}
              {FLOOR_PATHS.map((d, i) => (
                <path
                  key={i}
                  className="nk6-floor"
                  pathLength={1}
                  d={d}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: drawn ? 0 : 1,
                    transition: `stroke-dashoffset .3s linear ${i * 0.3}s`,
                  }}
                />
              ))}
            </svg>

            {/* Spratovi su dugmad preko crteža (i na mobilnom) */}
            <div className="absolute inset-0">
              {B.floors.map((f, i) => {
                const z = ZONES[i];
                if (!z) return null;
                const n = freeOf(f);
                const sold = n === 0;
                const sel = fSel === i;
                const on = sel || hov === i;
                return (
                  <div key={f.index}>
                    <button
                      type="button"
                      aria-label={`${f.name}, ${sold ? "sve prodato" : `${n} ${plural(n)} ${noun(n)}`}`}
                      aria-pressed={sel}
                      onClick={(e) => goFloor(i, e.currentTarget)}
                      onMouseEnter={() => setHov(i)}
                      onMouseLeave={() => setHov(null)}
                      onFocus={() => setHov(i)}
                      onBlur={() => setHov(null)}
                      className={`absolute m-0 cursor-pointer p-0 transition-[background,border-color] duration-[250ms] ease-[ease] ${FOCUS}`}
                      style={{
                        left: z.x,
                        top: z.y,
                        width: z.w,
                        height: z.h,
                        border: `1.5px solid ${on ? (sold ? "#8A8F99" : "#190C9C") : "transparent"}`,
                        background: sold ? HATCH : on ? "rgba(25,12,156,0.1)" : "transparent",
                      }}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -translate-y-1/2 text-[13px] font-medium whitespace-nowrap transition-opacity duration-[250ms] ease-[ease] max-md:hidden"
                      style={{
                        left: "calc(84.4% + 20px)",
                        top: z.labelY,
                        color: sold ? "#5E626B" : sel ? "#190C9C" : "#1C1D20",
                        opacity: on || sold ? 1 : 0,
                      }}
                    >
                      {f.name} · {countText(n)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobilni: spratovi i kao dugmad ispod crteža (povučeni sprat je na crtežu mali za prst) */}
          <div role="group" aria-label="Sprat" className="grid grid-cols-2 gap-2 md:hidden">
            {B.floors
              .map((f, i) => ({ f, i }))
              .reverse()
              .map(({ f, i }) => {
                const n = freeOf(f);
                const sold = n === 0;
                const sel = fSel === i;
                return (
                  <button
                    key={f.index}
                    type="button"
                    aria-pressed={sel}
                    aria-label={`${f.name}, ${sold ? "sve prodato" : `${n} ${plural(n)} ${noun(n)}`}`}
                    onClick={(e) => goFloor(i, e.currentTarget)}
                    className={`flex min-h-14 cursor-pointer flex-col items-start justify-center gap-0.5 rounded-[2px] px-3 py-2 text-left [font:inherit] transition-[background,border-color] duration-[250ms] ease-[ease] ${FOCUS}`}
                    style={{
                      border: `1.5px solid ${sel ? (sold ? "#8A8F99" : "#190C9C") : "#D9D6CF"}`,
                      background: sold ? HATCH : sel ? "rgba(25,12,156,0.1)" : "transparent",
                      color: sold ? "#5E626B" : sel ? "#190C9C" : "#1C1D20",
                    }}
                  >
                    <span className="text-[15px] font-semibold">{f.name}</span>
                    <span className="text-[13px]">{countText(n)}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Desktop: lista stanova izabranog sprata */}
      <div className="mt-[72px] max-md:hidden">
        {fl && (
          <div
            className="nk6-listwrap grid transition-[grid-template-rows] duration-[400ms] ease-mask"
            style={{ gridTemplateRows: listOpen ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div ref={titleDesk} className="pb-4">
                <ListTitle text={`${B.name} · ${fl.name}`} drawn={rowsVisible} className="nk-label text-ink-muted" />
              </div>
              {soldOut && (
                <div className="flex items-center justify-between gap-6 border-t border-line py-8">
                  <p className="m-0 text-[18px] leading-[1.5]">
                    Na ovom spratu su svi stanovi prodati. Pogledajte sprat iznad ili ispod.
                  </p>
                  <div className="flex gap-2">
                    <FloorArrow label="Sprat iznad" d="M7 13V1 M2 6L7 1L12 6" onClick={() => goFloor((fSel ?? 0) + 1)} />
                    <FloorArrow label="Sprat ispod" d="M7 1V13 M2 8L7 13L12 8" onClick={() => goFloor((fSel ?? 0) - 1)} />
                  </div>
                </div>
              )}
              {!soldOut && (
                <ul className="m-0 list-none p-0">
                  {rows.map((u, i) => (
                    <UnitRow key={u.key} u={u} i={i} rowsIn={rowsVisible} cols={cols} showOrient={B.hasOrientation} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        <div className="mt-12 flex flex-wrap gap-10 text-[15px] font-medium">
          <a href="/stanovi" className="border-b border-current pb-1">
            Svi stanovi →
          </a>
          <a href="/kontakt" className="border-b border-current pb-1 text-signal">
            Zakažite razgovor
          </a>
        </div>
      </div>

      {/* Mobilni, korak 3: stanovi izabranog sprata */}
      <div className="mt-10 md:hidden">
        <MobileStep n={3} text="Stan" active={step === 3} />
        {!fl && <p className="m-0 mt-3 text-[15px] leading-[1.5] text-ink-muted">Izaberite sprat na crtežu ili ispod njega.</p>}
        {fl && (
          <div
            className="nk6-listwrap mt-3 grid transition-[grid-template-rows] duration-[400ms] ease-mask"
            style={{ gridTemplateRows: listOpen ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div ref={titleMob} className="pb-3">
                <ListTitle text={`${B.name} · ${fl.name}`} drawn={rowsVisible} className="text-[15px] font-semibold" />
              </div>
              {soldOut ? (
                <div className="flex items-center justify-between gap-4 border-t border-line py-5">
                  <p className="m-0 text-[15px] leading-[1.5]">Na ovom spratu su svi stanovi prodati. Pogledajte sprat iznad ili ispod.</p>
                  <div className="flex shrink-0 gap-2">
                    <FloorArrow label="Sprat iznad" d="M7 13V1 M2 6L7 1L12 6" onClick={() => goFloor((fSel ?? 0) + 1)} />
                    <FloorArrow label="Sprat ispod" d="M7 1V13 M2 8L7 13L12 8" onClick={() => goFloor((fSel ?? 0) - 1)} />
                  </div>
                </div>
              ) : (
                <ul className="m-0 list-none p-0">
                  {rows.map((u, i) => (
                    <MobileUnit key={u.key} u={u} i={i} rowsIn={rowsVisible} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        <div className="mt-10 flex flex-col gap-5 text-[15px] font-medium">
          <a href="/stanovi">Svi stanovi →</a>
          <a href="/kontakt" className="text-signal">
            Zakažite razgovor
          </a>
        </div>
      </div>
    </section>
  );
}

function UnitRow({
  u,
  i,
  rowsIn,
  cols,
  showOrient,
}: {
  u: Row;
  i: number;
  rowsIn: boolean;
  cols: string;
  showOrient: boolean;
}) {
  const content = (
    <>
      <span className="text-[18px] font-semibold">{u.label}</span>
      <span className="text-[16px]">{u.struct}</span>
      {showOrient && <span className="text-[16px] text-ink-muted">{u.orient}</span>}
      <span className="flex items-center gap-2.5 text-[12px] font-medium tracking-[0.2em] uppercase">
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full"
          style={{
            background: u.available ? "#190C9C" : "#8A8F99",
            border: `1.5px solid ${u.available ? "#190C9C" : "#8A8F99"}`,
          }}
        />
        {u.available ? "Dostupan" : "Prodat"}
      </span>
      <span className="text-[14px]">{u.available ? u.price : ""}</span>
      <span className="justify-self-end text-[14px] font-medium whitespace-nowrap text-signal">
        {u.available ? "Pogledajte stan ↗" : ""}
      </span>
    </>
  );
  const rowClass = "grid items-baseline gap-x-6 py-5";

  return (
    <li
      className="nk6-row border-t border-line"
      style={{
        opacity: rowsIn ? 1 : 0,
        transform: rowsIn ? "translateY(0)" : "translateY(8px)",
        transition: `opacity .35s ease ${(i * 0.04).toFixed(2)}s, transform .35s ease ${(i * 0.04).toFixed(2)}s`,
      }}
    >
      {u.available ? (
        <a href={u.href} className={`${rowClass} ${FOCUS} hover:text-graphite`} style={{ gridTemplateColumns: cols }}>
          {content}
        </a>
      ) : (
        // Prodat: bez linka i cene, 40% neprozirnosti
        <div className={rowClass} style={{ gridTemplateColumns: cols, opacity: 0.4 }}>
          {content}
        </div>
      )}
    </li>
  );
}

/** Mobilni: oznaka koraka iznad bloka („1 Zgrada“, „2 Sprat“, „3 Stan“) */
function MobileStep({ n, text, active, className = "" }: { n: number; text: string; active: boolean; className?: string }) {
  return (
    <span
      aria-current={active ? "step" : undefined}
      className={`text-[12px] font-medium tracking-[0.3em] uppercase md:hidden ${active ? "text-graphite" : "text-ink-muted"} ${className}`}
    >
      {n} {text}
    </span>
  );
}

/** Mobilni: stan u dva reda; dostupan je ceo red link, prodat bez linka i cene, 40% */
function MobileUnit({ u, i, rowsIn }: { u: Row; i: number; rowsIn: boolean }) {
  const body = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[16px] font-semibold">{u.label}</span>
        <span className="flex items-center gap-2 text-[12px] font-medium tracking-[0.2em] uppercase">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full"
            style={{ background: u.available ? "#190C9C" : "#8A8F99", border: `1.5px solid ${u.available ? "#190C9C" : "#8A8F99"}` }}
          />
          {u.available ? "Dostupan" : "Prodat"}
        </span>
      </div>
      <div className="mt-1 text-[15px]">{u.mobLine}</div>
      {u.available && (
        <div className="mt-2 flex justify-between text-[14px]">
          <span>{u.price}</span>
          <span className="font-medium text-signal">Pogledajte stan ↗</span>
        </div>
      )}
    </>
  );
  return (
    <li
      className="nk6-row border-t border-line"
      style={{
        opacity: rowsIn ? 1 : 0,
        transform: rowsIn ? "translateY(0)" : "translateY(8px)",
        transition: `opacity .35s ease ${(i * 0.04).toFixed(2)}s, transform .35s ease ${(i * 0.04).toFixed(2)}s`,
      }}
    >
      {u.available ? (
        <a href={u.href} className={`block py-3.5 hover:text-graphite ${FOCUS}`}>
          {body}
        </a>
      ) : (
        <div className="py-3.5" style={{ opacity: 0.4 }}>
          {body}
        </div>
      )}
    </li>
  );
}

function FloorArrow({ label, d, onClick }: { label: string; d: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-11 w-11 cursor-pointer items-center justify-center border border-graphite bg-transparent text-inherit ${FOCUS}`}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path d={d} />
      </svg>
    </button>
  );
}
