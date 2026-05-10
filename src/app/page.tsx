const pillars = [
  {
    label: "Write",
    value: "Google Docs",
  },
  {
    label: "Publish",
    value: "Google Sheets",
  },
  {
    label: "Render",
    value: "Next.js",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-8 sm:px-10 lg:px-16">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-between gap-12">
        <header className="flex items-center justify-between border-b border-[var(--line)] pb-5">
          <span className="text-lg font-semibold tracking-normal">gdcms</span>
          <span className="text-sm text-[var(--muted)]">Google Drive CMS</span>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
              Drive in. Website out.
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-normal text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              Google Drive is the CMS.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Write pages in Google Docs, control publishing from Google Sheets,
              and render a fast static website with Next.js.
            </p>
          </div>

          <div className="grid gap-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.label}
                className="border border-[var(--line)] bg-white/60 p-5"
              >
                <p className="text-sm text-[var(--muted)]">{pillar.label}</p>
                <p className="mt-2 text-2xl font-semibold">{pillar.value}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="flex flex-col gap-3 border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>If you can use Google Drive, you can update your website.</span>
          <span>Docker + Traefik ready</span>
        </footer>
      </section>
    </main>
  );
}
