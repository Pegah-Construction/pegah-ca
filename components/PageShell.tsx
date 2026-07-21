import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eyebrow } from "@/components/Brand";

/**
 * Shared shell for the secondary (stub) routes. Gives each page the same
 * header/footer chrome and a simple titled hero so the navigation is fully
 * wired while real content is being written.
 */
export default function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="hero-surface border-b border-concrete-200 pt-32">
          <div className="mx-auto max-w-8xl px-6 pb-16 lg:px-10">
            <div className="accent-bar hero-animate mb-5" style={{ animationDelay: "0ms" }} />
            <Eyebrow className="hero-animate" style={{ animationDelay: "60ms" }}>{eyebrow}</Eyebrow>
            <h1 className="hero-animate mt-4 max-w-3xl font-display text-4xl font-black tracking-tight text-ink lg:text-6xl" style={{ animationDelay: "100ms" }}>
              {title}
            </h1>
            {intro ? (
              <p className="hero-animate mt-5 max-w-xl text-lg leading-relaxed text-concrete-500" style={{ animationDelay: "220ms" }}>
                {intro}
              </p>
            ) : null}
          </div>
        </section>
        <div className="mx-auto max-w-8xl px-6 py-20 lg:px-10">{children}</div>
      </main>
      <Footer />
    </>
  );
}
