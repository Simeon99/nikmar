# NIKMAR GRADNJA: predaja dizajna za izradu u Next.js

Ovaj paket sadrži odobren dizajn početne strane sajta NIKMAR GRADNJA (stambeni investitor, Kruševac i Vrnjačka Banja). Zadatak je da se početna strana napravi u Next.js-u tako da vizuelno i u ponašanju bude identična dizajnu.

## 0. Pravila rada

1. **Dizajn je izvor istine.** Fajlovi u `design/` sadrže tačne vrednosti: boje, veličine, razmake, tekst, trajanja animacija i formule za skrol. Ne izmišljaj vrednosti. Ako nešto nije definisano, izaberi najjednostavnije rešenje i zapiši ga u `DECISIONS.md`.
2. **Ne izmišljaj sadržaj.** Nikakve cene, datumi, kvadrature, sadržaji ili tvrdnje koje nisu u dizajnu ili u `content/`. Tekst koji fali ostaje kao vidljiv `[PODATAK: ...]` ili se element ne prikazuje (videti tačku 9).
3. **Bez preteranog inženjeringa.** Jednostavne komponente, bez nepotrebnih apstrakcija, bez state menadžment biblioteka.
4. **Radi sekciju po sekciju** (redosled u tački 7). Posle svake sekcije napravi screenshot na 1440×900 i 390×844, uporedi ga sa dizajn fajlom i stani da korisnik odobri.
5. **Bez crta (em dash, en dash) u tekstu** koji dodaješ.

## 1. Kako da čitaš dizajn fajlove (`design/*.dc.html`)

To su HTML fajlovi jednog dizajn alata. Svaki fajl je jedna sekcija.
- `<x-dc>` sadrži markup sa **inline stilovima**. To su konačne vrednosti, prepiši ih u Tailwind ili CSS module.
- `<helmet><style>` sadrži hover stanja, keyframes, media upite (mobilni ispod 768 px) i `prefers-reduced-motion`. I to je deo specifikacije.
- `{{ime}}` je vrednost izračunata u `renderVals()` u skripti na dnu fajla. Tu su podaci, stanja i **formule za animacije vezane za skrol**.
- `<sc-for list="{{x}}" as="y">` je petlja (`x.map`), `<sc-if value="{{c}}">` je uslov, `<dc-import name="X">` ubacuje sekciju iz fajla `X.dc.html`.
- `onClick="{{fn}}"` i ostali `on*` su obični React event handleri.
- Putanje slika su već prebačene na `/images/...` i `/logo/...` (vidi tačku 6).

| Fajl | Šta je |
|---|---|
| `HomeHero.dc.html` | Hero, početno stanje (desktop i mobilni) |
| `HomeHeroScrolled.dc.html` | Hero, krajnje stanje posle skrola |
| `HomeHeroPrototype.dc.html` | **Cela početna strana** sa skrol animacijama. Ovde je orkestracija: pinovanje hero sekcije, horizontalna galerija projekata, pinovanje sekcije „Kako gradimo“, redosled sekcija |
| `ProjectsSection.dc.html` | Sekcija Projekti (statičan prikaz + mobilni) |
| `HowWeBuild.dc.html` | Sekcija „Kako gradimo“ (SVG presek zida, 5 taktova) |
| `UnderConstruction.dc.html` | Sekcija „Šta je sada u izgradnji“ (vremenska linija, stanovi, Objekat 1, okolina) |
| `FindApartment.dc.html` | Sekcija „Pronađite svoj stan“ (izbor zgrade i sprata, lista stanova) |
| `ClosingFooter.dc.html` | Kraj strane, kontakt i podnožje |
| `Foundations.dc.html` | Ranija tabla sa tokenima. Za referencu samo; gde se razlikuje od sekcija, **sekcije imaju prednost** (npr. linije između stavki su kasnije uklonjene) |

Važno: `HomeHeroPrototype.dc.html` meri skrol ručno (`onScroll` + `setState`) jer dizajn alat nema GSAP. **To ne prepisuj.** Prevedi istu logiku u GSAP ScrollTrigger (vrednosti u tački 5).

## 2. Stack

- Next.js (App Router), TypeScript, `src/` struktura
- Tailwind CSS
- GSAP + ScrollTrigger + `@gsap/react` (`useGSAP`) za sve što je vezano za skrol
- Lenis za glatki skrol, povezan sa `gsap.ticker` i `ScrollTrigger.update`
- `next/font/google` za Manrope (težine 200, 300, 400, 500, 600)
- `next/image` za slike
- Bez Motion biblioteke osim ako baš zatreba. Prelazi stanja (fade, maska, otvaranje liste) su CSS tranzicije, kao u dizajnu.

## 3. Struktura (predlog)

```
src/
  app/layout.tsx           Manrope, Lenis provider, <Header/>
  app/page.tsx             početna, sekcije redom
  components/Header.tsx
  components/sections/Hero.tsx
  components/sections/Projects.tsx
  components/sections/HowWeBuild.tsx
  components/sections/UnderConstruction.tsx
  components/sections/FindApartment.tsx
  components/sections/Closing.tsx
  components/motion/SmoothScroll.tsx   Lenis + GSAP ticker
  lib/plural.ts            množina „dostupan / dostupna / dostupnih“
  lib/data.ts              čitanje content/*.json (kasnije baza ili CMS)
content/                   projects.json, construction.json, apartments.SAMPLE.json
public/images, public/logo
```

## 4. Tokeni

Boje:
- `graphite` #1C1D20 (tekst, tamne sekcije)
- `paper` #F4F2EE (pozadina)
- `mist` #AFB6D0 (akcent na grafitu, linije na tamnom)
- `stone` #8A8F99 (sekundarni tekst **samo na grafitu**)
- `ink-muted` #5E626B (sitan sekundarni tekst **na toploj beloj**, jer #8A8F99 tamo nema dovoljan kontrast)
- `signal` #190C9C (CTA i aktivna stanja **samo na svetloj pozadini**; na grafitu se ne vidi)
- pomoćne: `#D9D6CF` i `#DDD9D2` (tanke linije i podloge na svetlom), `#E6E3DC` (prazno polje za sliku)

Tipografija (samo Manrope):
- Etiketa: 500, 13 px (ili 11 do 12 px gde piše), velika slova, letter-spacing 0.3em
- Naslov sekcije: 200, naglašena reč 600, `clamp(40px, 5vw, 80px)`, letter-spacing -0.02em, line-height 1.05
- Telo: 400, 18 do 20 px, line-height 1.5, max širina 36ch
- Brojevi: 200, `font-variant-numeric: tabular-nums`

Raspored: 12 kolona, gutter 24 px, margina 80 px (desktop), 24 px (mobilni). Prelom za mobilni: 768 px. Za header: 1000 px (linkovi se kriju, pojavljuje se dugme za meni).

Easing: `cubic-bezier(0.16,1,0.3,1)` za ulaske, `cubic-bezier(0.65,0,0.35,1)` za maske i prelaze između stanja.

## 5. Sekcije i ponašanje

Redosled na strani: **Hero → [Sekcija 2, još nije dizajnirana] → Projekti → Kako gradimo → U izgradnji → Pronađite svoj stan → Kraj i podnožje.** Za sekciju 2 ostavi prazno mesto (`<section>` visine 60vh sa tekstom „[ Sekcija 2 ]“), kao u prototipu.

### 5.1 Header (`HomeHero`, `HomeHeroScrolled`, `HomeHeroPrototype`)
- Visina 76 px, padding 0 80 px. Logo levo (`/logo/nikmar-logo-crno.png`, visina 56 px), desno linkovi Projekti, Stanovi, O nama, Kontakt (400, 15 px, gap 40) i dugme „Zakažite razgovor“ (signal pozadina, paper tekst, 500, 15 px, visina 44, radius 2 px; hover: grafit).
- Linkovi imaju liniju ispod koja se na hover iscrtava s leva (`.nk-ul::after`).
- Kad hero slika dođe do vrha (eased progres > 0.85), header postaje providan, tekst paper, a logo se pretapa u `/logo/nikmar-logo-belo.png` (tranzicija 0.45s).
- Ispod 768 px: umesto celog logoa ide znak `/logo/nikmar-znak.png` (visina 40 px), dugme u headeru se krije.

### 5.2 Hero (vrednosti iz `HomeHeroPrototype.dc.html`)
- Na učitavanju: okvir slike se otkriva maskom iz centra (`clip-path: inset(50%) → inset(0)`, 0.9s, delay 0.2s), naslov ulazi odozdo (0.9s).
- Sekcija je pinovana kroz **1900 px skrola**. Progres `p = clamp(scroll / 900)`, easing easeInOutCubic (`e`):
  - okvir slike: `top 347px → 0`, `left` od početka 5. kolone (`(100% - 424px)/3 + 176px`) → 0, `right 80px → 0`, `bottom: 0`
  - tekst: `translateY(0 → -208px)` (parallax oko 0.6x)
  - slika: `scale(1 → 1.04)`, origin centar dole; slika je `object-fit: contain`, bottom aligned, na grafitnoj podlozi
  - zatamnjenje: opacity 0 → 1 (tri gradijenta, vidi fajl)
  - natpis „Vizuelizacija“: top 24 → 100 px, right 24 → 80 px
  - kartica „Heroja sa Košara“: ulazi za p 0.6 → 1 (opacity i translateY 24 → 0), nestaje između 1100 i 1500 px skrola
- Mobilni: bez pina i bez širenja; slika je ispod teksta preko cele širine, kartica ispod slike na toploj beloj, CTA preko cele širine.
- Tekst kartice (status gradnje) dolazi iz `content/construction.json` → `heroCardText`.

### 5.3 Projekti (`ProjectsSection.dc.html` + prototip)
- Pinovano, horizontalni skrol. Širina trake: `80 + 420 + 80 + 5×880 + 4×80 + 80`. Distanca pina `D = širina trake − širina viewporta`; traka se pomera `translateX(0 → -D)` scrub.
- Unutar svakog panela slika se pomera ±40 px suprotno od kretanja (parallax), u zavisnosti od udaljenosti panela od centra ekrana.
- Mobilni: paneli jedan ispod drugog, bez pina.
- Podaci iz `content/projects.json`.

### 5.4 Kako gradimo (`HowWeBuild.dc.html`)
- Grafitna pozadina. Pinovano kroz **4 × visina ekrana**. Takt (1 do 5) se menja na svakih 0.7 visine ekrana; posle takta 5 ide pauza od 0.5 visine ekrana (korak 6: nema teksta, crtež ostaje).
- Takt se **ne scrubuje**: kad se promeni, CSS tranzicije odrade ostalo (tekst fade + 20 px, sloj crteža `stroke-dashoffset 1 → 0` za 1s u boji mist, pa prelazi u paper posle 1s; korak 5 gasi presek na 20% i crta vremensku osu za 1.5s, pojavljuje se „11,5“).
- Koraci ZID · FASADA · ZVUK · POD · VREME dole levo su dugmad (na desktopu skrol do odgovarajućeg takta).
- Mobilni: bez pina, presek sa svim slojevima na vrhu, taktovi redom ispod.

### 5.5 U izgradnji (`UnderConstruction.dc.html`)
- Topla bela. Pinuje se **samo vremenska linija**: omotač visine 200vh, unutra sticky 100vh. Linija 2 px se iscrtava `scaleX(0 → 1)` scrub kroz taj jedan ekran.
- Render: maska s leva (1s) kad uđe u ekran (IntersectionObserver ili ScrollTrigger `once`).
- Trenutna faza: puna signal tačka i prsten koji pulsira (2s ciklus). Faza, tekst i datum iz `content/construction.json`.
- Brojač „Slobodno 29 od 52“ se **računa** iz podataka o stanovima, ne upisuje se.
- Crtež Objekta 1 se iscrtava za 1.5s pri ulasku. Mesta u blizini ulaze jedno po jedno (0.1s).
- Mobilni: linija uspravna, bez pina.

### 5.6 Pronađite svoj stan (`FindApartment.dc.html`)
- Bez pina. Crtež se iscrtava sprat po sprat odozdo (0.3s po spratu) pri ulasku.
- Spratovi su `<button>` preko SVG-a (pozicije u procentima su u fajlu). Hover i fokus: ispuna signal 10% i obris; rasprodat sprat: šrafura i stalna oznaka „sve prodato“.
- Lista se otvara visinom (`grid-template-rows 0fr → 1fr`, 0.4s), redovi ulaze sa razmakom 0.04s. Dostupni prvi, prodati na dnu sa 40% neprozirnosti, bez linka i cene.
- **Razlika u odnosu na mock:** na učitavanju **nijedan sprat nije izabran**, aktivan je korak „2 Sprat“, lista je zatvorena. (Mock ima I sprat izabran samo radi prikaza.)
- Množina mora da ide kroz `lib/plural.ts` (pravilo je u `renderVals`, metode `plural`, `noun`, `countText`).
- Podaci: za sada `content/apartments.SAMPLE.json`, **izmišljen primer**. Napravi `lib/data.ts` tako da se kasnije lako zameni bazom.
- Mobilni: spratovi kao accordion dugmad (odozgo nadole), redovi stanova u dva reda.

### 5.7 Kraj i podnožje (`ClosingFooter.dc.html`)
- Pozadina prelazi iz paper u graphite dok sekcija ulazi u ekran, interpolacijom kroz pola visine ekrana (ScrollTrigger scrub na `backgroundColor`). Uz reduced-motion: nagla promena.
- Naslov ulazi reč po reč (maska odozdo, 0.12s razmak). Linija ispod „Javite se Nikoli.“ se iscrtava za 0.8s.
- Telefon `tel:+381654184446`, mejl `mailto:nikmargradnja037@gmail.com`.
- Podnožje: beli logo (visina 104 px), navigacija, podaci firme, © red.
- Mobilni: „Pozovite“ (svetlo dugme) pa „Zakažite razgovor“ (obris), podnožje u jednoj koloni.

### 5.8 Za sve sekcije
- `prefers-reduced-motion`: bez Lenis-a, bez pinova i scrub-a; linije i crteži odmah nacrtani; sve ostalo samo fade. Pravila su u `@media (prefers-reduced-motion: reduce)` svakog fajla.
- Animiraj samo `transform`, `opacity`, `clip-path`, `stroke-dashoffset`. `ScrollTrigger.refresh()` posle učitavanja slika. Pinove gasi ispod 768 px preko `gsap.matchMedia`.

## 6. Asseti (`assets/` → kopiraj u `public/`)

| Fajl | Koristi se |
|---|---|
| `logo/nikmar-logo-crno.png` | header na svetlom |
| `logo/nikmar-logo-belo.png` | header preko slike, podnožje |
| `logo/nikmar-znak.png` | header na mobilnom |
| `images/heroja-sa-kosara-objekat-2-render.webp` | hero, Projekti 04, U izgradnji |
| `images/zgrada-jesen-foto.webp` | Projekti 01 |
| `images/fasada-lokali-cutout.webp` | Projekti 02 |
| `images/zgrada-sumrak-render.webp` | Projekti 03 |

Logoi su PNG. Kad stignu SVG verzije, zameni ih.

## 7. Redosled rada

1. Postavka projekta, tokeni, font, Lenis + GSAP, Header.
2. Hero (sa pinom). Stani za odobrenje.
3. Projekti. Stani.
4. Kako gradimo. Stani.
5. U izgradnji. Stani.
6. Pronađite svoj stan. Stani.
7. Kraj i podnožje. Stani.
8. Prolaz kroz mobilni (390 px), reduced-motion, tastatura i Lighthouse.

Dizajn fajlovi ne mogu da se otvore sami u browseru (zavise od runtime-a dizajn alata). Zato su inline vrednosti iz fajla specifikacija. Za vizuelno poređenje korisnik ima živi prototip i može da ti pošalje screenshot; ako se tvoj screenshot razlikuje, pitaj pre nego što menjaš vrednosti iz fajla.

## 8. Pristupačnost

- Pravi `<button>`, `<a href>`, `<ul>`; spratovi u crtežu su dugmad sa `aria-label` (npr. „Prizemlje, 4 dostupna stana“).
- `aria-label` na SVG crtežima (tekstovi su u fajlovima).
- Vidljiv fokus (1 do 1.5 px obris u signal ili mist boji).
- Kontrast: poštuj pravilo iz tačke 4 (stone samo na grafitu, ink-muted na toploj beloj).

## 9. Otvorene stvari (NE popunjavaj sam)

- **Sekcija 2** nema dizajn.
- **Dodela slika projektima 01 do 03 nije potvrđena.** Objekat 1 nema sliku.
- **Stanovi u `apartments.SAMPLE.json` su izmišljeni** (usklađeni samo sa 29 od 52 i rasprodatim II spratom Objekta 2).
- **Rok useljenja** za Objekat 2 nije poznat: oznaka se ne prikazuje.
- **MB i PIB** u podnožju: vidljiv `[PODATAK: MB i PIB]` dok ne stignu.
- **Instagram:** ne dodaje se dok se ne potvrdi da nalog postoji.
- „Zakažite razgovor“ i „Svi stanovi“ vode na stranice Kontakt i Stanovi, koje još ne postoje: privremeno `href="/kontakt"` i `href="/stanovi"`.
- Crteži (presek zida, fasada Objekta 1) su skice, ne nacrti iz projekta.

## 10. Gotovo je kada

- Na 1440×900 svaka sekcija odgovara dizajnu (razmaci, veličine, boje, tekst).
- Sve animacije rade u oba smera skrola i nema trzanja (60 fps na prosečnom laptopu).
- Mobilni (390 px) radi bez pinova, prema media upitima u fajlovima.
- Reduced-motion radi.
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95.
- Nema izmišljenog sadržaja; sve otvorene stavke iz tačke 9 su vidljive u `DECISIONS.md`.
