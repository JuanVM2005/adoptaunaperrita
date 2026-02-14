import HeroEditorial from "@/components/HeroEditorial";
import AdoptionDetails from "@/components/AdoptionDetails";
import PrecheckGate from "@/components/PrecheckGate";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <HeroEditorial />
      <AdoptionDetails />

      <section id="precheck-gate">
        <PrecheckGate />
      </section>
      <Footer/>
    </main>
  );
}
