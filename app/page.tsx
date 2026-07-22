import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PartnerStrip from "@/components/PartnerStrip";
import StatBand from "@/components/StatBand";
import Intro from "@/components/Intro";
import FeaturedProjects from "@/components/FeaturedProjects";
import ServicesList from "@/components/ServicesList";
import SafetyBand from "@/components/SafetyBand";
import Footer from "@/components/Footer";

// Rendered per-request so the featured projects are freshly randomized.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <PartnerStrip />
        <StatBand />
        <Intro />
        <FeaturedProjects />
        <ServicesList />
        <SafetyBand />
      </main>
      <Footer />
    </>
  );
}
