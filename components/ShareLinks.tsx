/**
 * Per-network share buttons in each network's own colour — the pattern readers
 * recognise on a blog post. Plain links to each share endpoint, so this needs
 * no client JavaScript and works with the keyboard like any other link.
 *
 * `url` should be the canonical public address of the post, not the host the
 * page happens to be served from.
 */
const NETWORKS = [
  {
    name: "Facebook",
    color: "#1877F2",
    share: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    path: "M22.675 0h-21.35C.595 0 0 .595 0 1.325v21.351C0 23.404.595 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.325-.596 1.325-1.324V1.325C24 .595 23.405 0 22.675 0z",
  },
  {
    name: "X",
    color: "#000000",
    share: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    name: "LinkedIn",
    color: "#0A66C2",
    share: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z",
  },
];

export default function ShareLinks({ url, title }: { url: string; title: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {NETWORKS.map((n) => (
        <a
          key={n.name}
          href={n.share(url, title)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${n.name}`}
          style={{ backgroundColor: n.color }}
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-display text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d={n.path} />
          </svg>
          {n.name}
        </a>
      ))}
    </div>
  );
}
