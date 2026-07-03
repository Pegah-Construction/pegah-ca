// Shared two-panel shell for the auth pages (forgot / reset password), matching
// the LoginScreen aesthetic.
export default function AuthPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-brand-900 p-12 lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white font-display text-xl font-black text-brand-800">P</span>
          <span className="font-display text-lg font-extrabold tracking-tight text-white">PEGAH<span className="text-brand-300"> Admin</span></span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-black leading-tight tracking-tight text-white">Project &amp; operations console</h1>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-brand-100/80">Monitor projects, teams, safety and documents across every Pegah site — all in one place.</p>
        </div>
        <p className="font-mono text-[11px] text-brand-200/60">Internal use only · Pegah Construction Ltd.</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
