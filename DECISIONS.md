# Odluke koje nisu u dizajnu

## Postavka

- **Next.js 16.4 (App Router, Turbopack), Tailwind 4, GSAP 3.15 + ScrollTrigger + @gsap/react, Lenis 1.3.** Projekat je napravljen sa `create-next-app` (podrazumevano uključeni `cacheComponents` i `partialPrefetching` su ostavljeni).
- **npm skripte pozivaju `node node_modules/...` direktno.** Putanja foldera sadrži `&` („S&N“), pa Windows `.cmd` shimovi (`next`, `tsc`, `eslint`) ne rade. `npm run dev`, `build`, `lint` i `typecheck` rade normalno.
- **`assets/` je kopiran u `public/`** (`public/images`, `public/logo`). Original u `assets/` je ostavljen.
- **Prelomi:** dizajn koristi `max-width: 768px` za mobilni i `max-width: 1000px` za header. U Tailwind-u je `md` postavljen na 769px, a dodat je `nav` na 1001px, da bi 768 i 1000 px tačno pripali mobilnom, odnosno meniju. `gsap.matchMedia` koristi `(min-width: 769px)`.
- **Manrope** preko `next/font/google`, težine 200 do 600, podskupovi `latin` i `latin-ext` (zbog č, ć, š, ž, đ).
- **Metadata (title, description)** je sastavljen od teksta iz hero sekcije, bez novih tvrdnji.

## Header

- **Header je fiksiran i skriva se pri skrolu na dole, a pojavljuje se pri skrolu na gore, bilo gde na stranici** (odluka korisnika, 21. 11. 2026). Odstupa od prototipa, gde header posle pina odlazi sa hero sekcijom i ne vraća se.
  - Dok je hero pinovan (prvih 1900 px na desktopu), header je uvek vidljiv. Na mobilnom se skriva čim skrol krene na dole.
  - Animacija pojavljivanja (zahtev korisnika): header uklizi odozgo za 0.6s sa easing-om za ulaske `cubic-bezier(0.16,1,0.3,1)`, a logo, linkovi i dugme zatim ulaze jedno za drugim (opacity 0 → 1 i 12 px odozgo, kašnjenje 0.12s + 0.05s po stavci). Sklanjanje je brže: 0.35s sa easing-om za prelaze, stavke se gase za 0.2s bez kašnjenja. Uz reduced-motion: bez klizanja, samo fade stavki. Kad fokus tastature uđe u header, header se prikazuje.
  - Ton: providan sa belim logoom dok je ispod njega hero slika (eased progres > 0.85, dok slika ne ode ispod headera). Na ostatku strane je svetao (paper pozadina, crni logo), i preko tamnih sekcija.
  - Header renderuje `Hero.tsx`, jer od njega dobija ton i dužinu pina. Na budućim stranicama (Kontakt, Stanovi) ide samo `<Header />`.
- **Stanje preko slike** (providan, paper tekst, beli logo) koristi hover i fokus iz `HomeHeroScrolled.dc.html`: linkovi mist, dugme na hover paper pozadina i grafitni tekst, fokus obris mist. Prototip na tom mestu zadržava hover za svetlu pozadinu, što se na slici ne vidi.
- **Linkovi:** Projekti `/#projekti` (sekcija na početnoj), Stanovi `/stanovi`, O nama `/o-nama`, Kontakt `/kontakt`, „Zakažite razgovor“ `/kontakt`. Stranice Stanovi, O nama i Kontakt još ne postoje.
- **Dugme za meni (do 1000 px)** je prikazano kao u dizajnu, ali **sam meni nije dizajniran**, pa dugme za sada ne radi ništa. Otvorena stavka.

## Hero

- **Okvir slike se animira preko `clip-path` i `transform`**, ne preko `top/left/right` kao u prototipu (HANDOFF 5.8: animiraju se samo transform, opacity, clip-path). `figure` je preko celog ekrana i sečen je na okvir iz prototipa; slika je raspoređena za krajnje stanje i skalira se tako da u svakom trenutku zauzima isto mesto kao u prototipu (contain u polju 4% / 12% / 92% / 88%, poravnata dole, pa `scale 1 → 1.04`). Formule i brojevi su isti.
- **Zatamnjenje** je preko celog ekrana, ne samo preko okvira. Dok je okvir mali, opacity je blizu 0, pa razlika nije vidljiva.
- **Maska na učitavanju** (0.9s, delay 0.2s) na desktopu radi GSAP, jer se kombinuje sa skrolom; na mobilnom je CSS animacija iz `HomeHero`. Pre hidratacije okvir je skupljen u centar, pa nema treptanja.
- **Reduced-motion na desktopu:** pin ostaje, a stanja skaču (p > 0.5 znači kraj, kartica vidljiva dok je skrol 900 do 1300 px), kako je napisano u `renderVals` prototipa. HANDOFF 5.8 kaže „bez pinova“; za hero je ispoštovan prototip jer se bez pina kartica na desktopu nikad ne bi prikazala. **Treba potvrda.**
- **„Istražite projekat ↗“** vodi na `#u-izgradnji` (sekcija o istom objektu na početnoj), jer stranica projekta ne postoji.
- **Tekst kartice** dolazi iz `content/construction.json` → `heroCardText` preko `src/lib/data.ts`.

## Projekti

- **Slike projekata su kvadratne (1:1) na svim ekranima** (zahtev korisnika, 21. 11. 2026; pre toga probano 4:5). Dizajn ima panel 880 px (desktop) i sliku visine 280 px (mobilni).
  - Desktop: stranica kvadrata je `max(320px, 100vh − 390px)`, i to je širina panela (na 1440×900: 510 × 510 px). Prototip ima visinu `100vh − 330px`. Slika je niža za 60 px jer je tekst ispod nje sada u dva reda, pa ukupna visina panela ostaje kao u prototipu i panel ne ide ispod headera.
  - Zbog užih panela, dužina horizontalnog skrola i centri panela za parallax se **mere** (`scrollWidth`, `offsetLeft`) pri svakom refresh-u, umesto formule sa 880 px. Na 1440×900 skrol je 2090 px (ranije 3940).
  - **Sve slike popunjavaju kvadrat (`object-fit: cover`)**, i izrezane zgrade 02 i 04, da se lepo uklope (zahtev korisnika). Polje `imageFit` iz `projects.json` se zato ne koristi. Kadriranje: 01 `center 40%`, 02 i 04 `center bottom`, 03 `center 72%`. Kod 02 se iznad krova vidi tanka tamna traka (providan deo same slike).
  - Na desktopu su slike šire za 2 × 40 px, da parallax od ±40 px nikad ne otkrije ivicu.
- **Mobilni ima isti pin i horizontalni skrol kao desktop** (zahtev korisnika, 21. 11. 2026, „pa ćemo videti“). Dizajn i HANDOFF 5.3 traže mobilni bez pina, paneli jedan ispod drugog. Predlog sa prevlačenjem (scroll-snap) je odbijen za sada.
  - Visina `100svh` (najmanje 560 px). Uvod zauzme prvi ekran (širina ekrana − 48 px), pa idu paneli sa razmakom 24 px.
  - Stranica kvadrata na mobilnom: `min(100vw − 48px, 100svh − 330px)`, da ceo panel stane i na niskim ekranima (375×667).
  - Parallax ±40 px radi i na mobilnom; slike su šire za 2 × 40 px na svim ekranima.
  - Na 390×844 horizontalni deo traje 1830 px skrola. Odmah posle dolazi zakačena „Kako gradimo“, pa je na telefonu dug deo stranice bez pomeranja nadole. Proveriti na pravom telefonu.
- **Red ispod slike: broj levo i „Istražite ↗“ desno u prvom redu**, a grad, status, naziv i broj stanova ispod, preko cele širine (zahtev korisnika). U dizajnu je 96px | tekst | „Istražite“, pa se u užoj koloni naslovi lome.
- Ostalo iz prototipa i `ProjectsSection`: razmak u panelu 28 px (desktop) i 32 px (mobilni), paneli razmaknuti 80 px (desktop) i 56 px (mobilni).
- **Broj projekta postaje signal plav na hover panela** (0.5s, zajedno sa „Istražite ↗“), dogovor sa korisnikom. Stalno plavi brojevi su odbačeni: signal je samo za CTA i aktivna stanja.
- **Hover zoom slike** (`scale 1.03`, 1.2s) iz `ProjectsSection` je na posebnom sloju oko slike, jer sama slika nosi parallax `transform`. U prototipu hover zoom nije bio uključen.
- **Kadriranje slika** (`center 40%`, `center 72%`) je u komponenti i vezano je za fajl slike, ne za projekat, jer dodela slika nije potvrđena.
- **Tekst „16 stanova“, „21 stan · 3 lokala“** se računa iz `apartments` i `commercial` preko `lib/plural.ts`.
- **Reduced-motion na desktopu:** pin ostaje, parallax je isključen (kao `renderVals` u prototipu). Isto pitanje kao za hero.
- **Linkovi:** paneli vode na `/projekti/{slug}`, „Svi projekti“ na `/projekti`. Te stranice još ne postoje. Na stranici je link samo slika (kao u dizajnu); „Istražite ↗“ je oznaka koja reaguje na hover panela.
- Sekcija ima `id="projekti"` za link u headeru.

## Kako gradimo

- **Takt se računa kao u prototipu** (`s4Step`): počinje kad je vrh sekcije na 30% ekrana, menja se na svakih 0.7 visine ekrana, posle takta 5 (od 3.5 ekrana) je korak 6 bez teksta. Pin traje 4 visine ekrana. Takt je React stanje; ScrollTrigger samo javlja promenu, a crtanje, fade i pomeraj teksta rade CSS tranzicije iz dizajna.
- **Dugmad ZID · FASADA · ZVUK · POD · VREME** skroluju do sredine svog takta preko Lenis-a (`lib/scroll.ts`, `scrollToY`). Bez Lenis-a (reduced-motion): nativni skrol bez animacije.
- **Reduced-motion:** slojevi 1 do 4 su odmah nacrtani, tekst samo fade (iz dizajna). Vremenska osa (sloj 5) se uz reduced-motion pojavljuje fade-om tek na taktu 5; u dizajnu ima `transition: opacity` bez vrednosti za opacity, pa je to protumačeno ovako. Pin ostaje, kao kod hero sekcije i Projekata.
- **Mobilni ima isti pin i iste taktove kao desktop** (zahtev korisnika, 21. 11. 2026). Dizajn i HANDOFF 5.4 traže mobilni bez pina, sa svim slojevima nacrtanim i taktovima redom; to je zamenjeno. Raspored na mobilnom:
  - visina `100svh` (najmanje 560 px), gore tekst takta (polje 290 px), u sredini presek koji zauzima preostali prostor, dole koraci ZID · FASADA · ZVUK · POD · VREME (razmak slova 0.2em da stanu u jedan red);
  - naslov 40 px (takt 5: 32 px), tekst 18 px, manji razmaci (mt 16 i 20 px) da sve stane i na ekranu 375×667;
  - „11,5 Meseci“ je 72 px iznad preseka; datumi na vremenskoj osi su u crtežu krupniji (22 umesto 12 jedinica), jer se crtež skalira na širinu ekrana;
  - mobilni blokovi iz dizajna (naziv sloja iznad takta, posebna vremenska osa ispod takta 5) su uklonjeni, jer ih sada zamenjuju koraci i crtež.
- Pravila za reduced-motion su u `globals.css` (`.nk-l14`, `.nk-l5`, `.nk-takt`). CSS modul nije korišćen jer Turbopack ne izvozi klase koje postoje samo unutar `@media` blokova.
- Header (svetao) se preko ove tamne sekcije pojavljuje sa paper pozadinom.

## U izgradnji

- **Slika u bloku „Zgrada koja raste.“ je `zgrada-jesen-cutout.png`** umesto rendera Objekta 2 (zahtev korisnika, 21. 11. 2026; pre toga probana `zgrada-jesen-foto.webp`). To je ista zgrada kao na jesenjoj fotografiji, sa izrezanim nebom (PNG sa providnošću, korisnik ga je dodao kao „Modern Apartment Complex Cutout.png“, preimenovan bez razmaka). Popunjava okvir 16:10 (`cover`, poravnata dole) na grafitnoj pozadini, bez natpisa „Vizuelizacija“. Ista zgrada je i u Projektima kao 01 Olimpijska 56V (dodela nije potvrđena), pa treba potvrditi koja zgrada je na slici.
- **Brojač „Slobodno 29 od 52“ i rasponi kvadrature** („20,67 do 23,31 m²“ itd.) se računaju iz `apartments.SAMPLE.json` (oba objekta zajedno) u `lib/data.ts` (`getApartmentStats`). Brojevi se poklapaju sa dizajnom, ali su podaci **izmišljeni primer** dok ne stigne baza.
- **Tekst „Ukupno 52 stana i 26 parking mesta“** je prepisan iz dizajna (broj parking mesta nije u podacima).
- **Faze, tekst stanja i datum** dolaze iz `construction.json` (`phases`, `currentPhaseIndex`, `statusText`, `statusDate`).
- **Vremenska linija:** desktop kao u dizajnu, omotač 200vh sa sticky ekranom (CSS `position: sticky`, ne GSAP pin), linija `scaleX 0 → 1` scrub preko ScrollTrigger-a dok omotač prolazi. Mobilni bez pina, uspravna linija `scaleY` od trenutka kad je vrh na 80% do 30% ekrana (formula iz dizajna). Uz reduced-motion linija je odmah puna.
- **Ulasci (render, crtež Objekta 1, mesta u blizini)** preko `lib/useInView.ts` (IntersectionObserver, threshold 0.25, kao u dizajnu). Za render se posmatra ceo blok, ne figura, jer IntersectionObserver uračunava `clip-path` figure i inače se nikad ne okine.
- **„Pogledajte slobodne stanove“** vodi na `#stanovi`, sekciju „Pronađite svoj stan“ na istoj strani.
- Sekcija ima `id="u-izgradnji"` (link „Istražite projekat“ iz hero kartice).

## Pronađite svoj stan

- **Po defaultu je izabran sprat sa najviše slobodnih stanova** (odluka korisnika, 21. 11. 2026; kod jednakih, niži sprat). Ovo **poništava izmenu iz HANDOFF 5.6** („na učitavanju nijedan sprat nije izabran“); mock je imao fiksno I sprat. Lista stanova je odmah prikazana, aktivan je korak „3 Stan“. Sa sadašnjim podacima: Objekat 2 → Prizemlje (4), Objekat 1 → I sprat (6). Izabrana je prva zgrada (Objekat 2), kao u dizajnu.
  - Redovi i linija ispod naslova liste ulaze kad crtež uđe u ekran (threshold 0.3), ne na učitavanju strane.
  - **Promena zgrade bira sprat sa najviše slobodnih u toj zgradi**, bez auto-skrola.
- **Podaci** iz `apartments.SAMPLE.json` (izmišljen primer), grupisani po zgradi i spratu u `lib/data.ts` (`getBuildingsWithFloors`). Strane sveta se prikazuju samo za zgradu sa `hasOrientation: true`.
- **Cena:** u podacima je `null`, prikazuje se „Cena na upit“ (iz dizajna). Format i valuta za prave cene nisu definisani; za sada se broj prikazuje sa srpskim formatom bez valute.
- **Linkovi:** red dostupnog stana vodi na `/stanovi/{zgrada}/{broj}`, „Svi stanovi“ na `/stanovi`, „Zakažite razgovor“ na `/kontakt`. Te stranice još ne postoje.
- **Neaktivni koraci „1 Zgrada · 2 Sprat · 3 Stan“** su u boji ink-muted (#5E626B) umesto stone (#8A8F99) iz dizajna, po pravilu kontrasta iz HANDOFF tačke 4 (stone samo na grafitu). Tačke razdvajanja i šrafura ostaju stone (dekorativne).
- **Hover na redu stana ne boji ceo red u plavo** (dizajn nema hover za red; opšte pravilo za linkove bi ga obojilo). Plav ostaje samo „Pogledajte stan ↗“.
- **Povratna informacija pri izboru sprata** (zahtev korisnika, desktop i mobilni; nije u dizajnu):
  - talas oko kliknute zone ili dugmeta sprata (`box-shadow` 0 → 12 px, signal, 0.6s, Web Animations API);
  - blagi skrol preko Lenis-a do naslova liste, **samo ako lista nije već u ekranu** (naslov iznad 90 px ili ispod 60% ekrana). Mobilni: naslov 110 px od vrha (ispod headera); desktop: na 40% ekrana, da izabrani sprat na crtežu ostane vidljiv;
  - kratka signal linija (48 × 2 px) ispod naslova liste se iscrta pri svakom novom izboru (0.6s).
  - Uz reduced-motion: bez talasa, skrol je trenutan.
- **Mobilni je prerađen u tri koraka** (zahtev korisnika, 21. 11. 2026). Dizajn i HANDOFF 5.6 imaju crtež bez izbora i spratove kao accordion; to je zamenjeno:
  - redosled: naslov, „1 Zgrada“ (dugmad zgrada), „2 Sprat“ (crtež), „3 Stan“ (lista); oznake koraka su vidljive i na mobilnom, trenutni korak je grafitan;
  - spratovi se biraju tapom po crtežu (iste zone, isto označavanje i šrafura kao na desktopu, bez natpisa sa strane) ili preko četiri dugmeta ispod crteža (2 × 2, odozgo nadole: naziv i „N dostupna“), jer je povučeni sprat na crtežu nizak za prst;
  - lista stanova se otvara i redovi ulaze isto kao na desktopu (visina 0.4s, razmak 0.04s); dostupan stan je ceo red link, prodat je bez linka i cene, 40%;
  - rasprodat sprat: poruka i strelice za sprat iznad i ispod, kao na desktopu;
  - uputstvo „Izaberite sprat na crtežu ili ispod njega.“ ostaje u kodu samo za slučaj zgrade bez spratova; pošto je sprat uvek izabran, inače se ne prikazuje.
- Sekcija ima `id="stanovi"` (dugme „Pogledajte slobodne stanove“ iz sekcije U izgradnji).

## Kraj i podnožje

- **Pozadina paper → graphite** preko ScrollTrigger scrub-a na `backgroundColor`, dok vrh sekcije ide od dna do polovine ekrana (formula iz dizajna). Uz reduced-motion: nagla promena kad je vrh sekcije na 75% ekrana (pola puta).
- **Naslov reč po reč i linija ispod „Javite se Nikoli.“** se pokreću ulaskom u ekran (`useInView`, threshold 0.35, kao u dizajnu).
- **Mejl na mobilnom je 22 px** umesto 28 px, da adresa stane u jedan red (u dizajnu se lomi na „...gmail.c / om“). Desktop ostaje 28 px.
- **Linkovi:** „Zakažite razgovor“ na `/kontakt`; navigacija u podnožju je ista kao u headeru (`LINKS` iz `Header.tsx`). Telefon i mejl iz HANDOFF 5.7.
- **MB i PIB:** vidljiv `[PODATAK: MB i PIB]`. Instagram nije dodat.
- Sekcija ima `id="kontakt"`.

## Razvoj

- Dev server (Turbopack) na ovoj putanji ponekad ne povuče izmenu u `globals.css`. Ako se izmena ne vidi, restartovati `npm run dev`.

## Sekcija 2

- Prazno mesto (60vh, „[ Sekcija 2 ]“) je odmah posle hero sekcije, po redosledu iz HANDOFF 5. U prototipu je prazno mesto („Sekcija 3“) posle Projekata.

## Otvorene stavke (HANDOFF tačka 9, ne popunjavam sam)

- Sekcija 2 nema dizajn.
- Dodela slika projektima 01 do 03 nije potvrđena. Objekat 1 nema sliku.
- Stanovi u `apartments.SAMPLE.json` su izmišljeni.
- Rok useljenja za Objekat 2 nije poznat: oznaka se ne prikazuje.
- MB i PIB: vidljiv `[PODATAK: MB i PIB]`.
- Instagram: ne dodaje se dok se ne potvrdi nalog.
- Stranice Kontakt i Stanovi ne postoje: privremeno `/kontakt` i `/stanovi`.
- Crteži su skice, ne nacrti.
- SVG logo: kad stigne, zameniti PNG.
- Meni za ekrane do 1000 px nije dizajniran.
