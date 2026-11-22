// Čitanje sadržaja iz content/*.json. Kasnije se ovde menja izvor (baza ili CMS).
import construction from "../../content/construction.json";
import projects from "../../content/projects.json";
import apartments from "../../content/apartments.SAMPLE.json";

export type Construction = {
  project: string;
  phases: string[];
  currentPhaseIndex: number;
  statusText: string;
  statusDate: string;
  moveInDate: string | null;
  heroCardText: string;
  sitePhotos: string[];
};

export type Project = {
  number: string;
  slug: string;
  name: string;
  nameLight: string;
  nameBold: string;
  city: string;
  status: "completed" | "under_construction" | "second_phase";
  statusLabel: string;
  apartments: number;
  commercial: number | null;
  image: string | null;
  imageFit: "cover" | "contain";
  isRender: boolean;
  imageAlt: string;
};

export type Apartment = {
  building: string;
  floorIndex: number;
  floorName: string;
  number: number;
  structure: "garsonjera" | "jednoiposoban" | "dvosoban";
  areaM2: string; // „20,67“
  orientation: string | null;
  status: "available" | "sold";
  price: number | null;
};

export type Building = { id: string; name: string; hasOrientation: boolean };

/** IZMIŠLJEN PRIMER (apartments.SAMPLE.json). Ovde se kasnije čita baza stanova. */
export function getApartmentData(): { buildings: Building[]; apartments: Apartment[] } {
  return { buildings: apartments.buildings as Building[], apartments: apartments.apartments as Apartment[] };
}

export type Floor = { index: number; name: string; units: Apartment[] };
export type BuildingWithFloors = Building & { floors: Floor[] };

/** Zgrade sa stanovima grupisanim po spratu (odozdo nagore). */
export function getBuildingsWithFloors(): BuildingWithFloors[] {
  const { buildings, apartments: list } = getApartmentData();
  return buildings.map((b) => {
    const byFloor = new Map<number, Floor>();
    for (const a of list.filter((x) => x.building === b.id)) {
      if (!byFloor.has(a.floorIndex)) byFloor.set(a.floorIndex, { index: a.floorIndex, name: a.floorName, units: [] });
      byFloor.get(a.floorIndex)!.units.push(a);
    }
    const floors = [...byFloor.values()].sort((x, y) => x.index - y.index);
    floors.forEach((f) => f.units.sort((x, y) => x.number - y.number));
    return { ...b, floors };
  });
}

const STRUCTURES:{ key: Apartment["structure"]; label: string }[] = [
  { key: "garsonjera", label: "Garsonjere" },
  { key: "jednoiposoban", label: "Jednoiposobni" },
  { key: "dvosoban", label: "Dvosobni" },
];

/** Slobodni stanovi i rasponi kvadrature po strukturi, računato iz podataka o stanovima. */
export function getApartmentStats() {
  const list = getApartmentData().apartments;
  const area = (a: Apartment) => parseFloat(a.areaM2.replace(",", "."));
  const fmt = (n: number) => n.toFixed(2).replace(".", ",");
  const ranges = STRUCTURES.map(({ key, label }) => {
    const areas = list.filter((a) => a.structure === key).map(area);
    if (!areas.length) return null;
    const min = Math.min(...areas);
    const max = Math.max(...areas);
    return { label, text: min === max ? fmt(min) : `${fmt(min)} do ${fmt(max)}` };
  }).filter((r) => r !== null);
  return {
    free: list.filter((a) => a.status === "available").length,
    total: list.length,
    ranges,
  };
}

export function getConstruction(): Construction {
  return construction as Construction;
}

export function getProjects(): Project[] {
  return projects as Project[];
}
