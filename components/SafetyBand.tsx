import Button from "./Button";
import { Eyebrow } from "./Brand";

export default function SafetyBand() {
  return (
    <section className="bg-brand-800">
      <div className="mx-auto flex max-w-8xl flex-col gap-8 px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="max-w-2xl">
          <Eyebrow className="text-brand-200">Safety first</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white lg:text-4xl">
            Safety is our number-one priority — every site, every day.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-brand-100/80">
            Quality construction delivered safely is an attainable goal we hold
            every member of our organization accountable to.
          </p>
        </div>
        <Button href="/safety" variant="white">
          Our safety record →
        </Button>
      </div>
    </section>
  );
}
