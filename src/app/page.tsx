import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import HowWeBuild from "@/components/sections/HowWeBuild";
import UnderConstruction from "@/components/sections/UnderConstruction";
import FindApartment from "@/components/sections/FindApartment";
import Closing from "@/components/sections/Closing";
import { getApartmentStats, getBuildingsWithFloors, getConstruction, getProjects } from "@/lib/data";

export default function Home() {
  const construction = getConstruction();
  const stats = getApartmentStats();

  return (
    <main>
      <Hero cardText={construction.heroCardText} />

      {/* Sekcija 2 još nije dizajnirana (HANDOFF.md, tačka 9) */}
      <section aria-label="Sekcija 2" className="h-[60vh] bg-paper px-6 py-[120px] md:px-20">
        <span className="nk-label text-ink-muted">[ Sekcija 2 ]</span>
      </section>

      <Projects projects={getProjects()} />

      <HowWeBuild />

      <UnderConstruction
        construction={construction}
        free={stats.free}
        total={stats.total}
        ranges={stats.ranges}
      />

      <FindApartment buildings={getBuildingsWithFloors()} />

      <Closing />
    </main>
  );
}
