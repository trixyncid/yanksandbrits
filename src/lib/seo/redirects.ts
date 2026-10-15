/** Legacy URLs. Add entries only when old paths are supplied. Do not crawl a previous site to fill this. */
export const legacyRedirects: { source: string; destination: string; permanent: boolean }[] = [
  // The About page was folded into Contact. Listed before the prefix rule so it lands in one hop.
  { source: "/:locale(id|en)/about", destination: "/contact", permanent: true },
  { source: "/about", destination: "/contact", permanent: true },
  // The site used to serve Bahasa Indonesia under /id and English under /en. It is English only now,
  // so every old prefixed address moves to the same page without the prefix.
  { source: "/:locale(id|en)", destination: "/", permanent: true },
  { source: "/:locale(id|en)/:path*", destination: "/:path*", permanent: true },
  // Each expo is a section of /expo, not a page of its own. Temporary, since an expo's slug can change.
  { source: "/expo/:slug", destination: "/expo#:slug", permanent: false },
];
