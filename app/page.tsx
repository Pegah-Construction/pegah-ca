import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatBand from "@/components/StatBand";
import Intro from "@/components/Intro";
import FeaturedProjects from "@/components/FeaturedProjects";
import ServicesList from "@/components/ServicesList";
import SafetyBand from "@/components/SafetyBand";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
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
