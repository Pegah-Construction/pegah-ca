import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PartnerStrip from "@/components/PartnerStrip";
import StatBand from "@/components/StatBand";
import Intro from "@/components/Intro";
import FeaturedProjects from "@/components/FeaturedProjects";
import ServicesList from "@/components/ServicesList";
import SafetyBand from "@/components/SafetyBand";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Rendered per-request so newly added projects, photos and edited site copy
// show up right away.
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
