// Množina u srpskom, pravilo iz FindApartment.dc.html (plural, noun, countText).

/** Bira oblik: jedan (1, 21, 31...), nekoliko (2 do 4, osim 12 do 14), mnogo (ostalo). */
export function form(n: number, one: string, few: string, many: string): string {
  const a = n % 10;
  const b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && !(b >= 12 && b <= 14)) return few;
  return many;
}

/** dostupan / dostupna / dostupnih */
export const plural = (n: number) => form(n, "dostupan", "dostupna", "dostupnih");

/** stan / stana / stanova */
export const noun = (n: number) => form(n, "stan", "stana", "stanova");

/** lokal / lokala / lokala */
export const lokal = (n: number) => form(n, "lokal", "lokala", "lokala");

/** „4 dostupna“ ili „sve prodato“ */
export const countText = (n: number) => (n === 0 ? "sve prodato" : `${n} ${plural(n)}`);
