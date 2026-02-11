import HeroEditorial from "@/components/HeroEditorial";
import AdoptionDetails from "@/components/AdoptionDetails";
import PrecheckGate from "@/components/PrecheckGate";

export default function Home() {
  return (
    <main>
      <HeroEditorial />
      <AdoptionDetails />

      <section id="precheck-gate">
        <PrecheckGate />
      </section>
    </main>
  );
}
