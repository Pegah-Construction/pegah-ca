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
      <main>
        <section className="border-b border-concrete-200 bg-white pt-32">
          <div className="mx-auto max-w-8xl px-6 pb-16 lg:px-10">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-black tracking-tight text-ink lg:text-6xl">
              {title}
            </h1>
            {intro ? (
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-concrete-500">
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
