import type { Metadata } from "next";
import { Montserrat, Roboto } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { company, siteUrl } from "@/lib/site";
import "./globals.css";

const display = Montserrat({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const body = Roboto({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
  display: "swap",
});

const DESCRIPTION =
  "Pegah Construction Ltd. is an established general contracting and project-management firm serving Ontario across institutional, commercial, industrial (ICI) and residential sectors since 1988.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pegah Construction Ltd. | General Contractor in Ontario since 1988",
    template: "%s | Pegah Construction Ltd.",
  },
  description: DESCRIPTION,
  applicationName: "Pegah Construction Ltd.",
  keywords: [
    "general contractor Ontario",
    "construction management",
    "design-build",
    "ICI construction",
    "commercial construction Toronto",
    "industrial construction",
    "institutional construction",
    "residential construction Ontario",
    "Pegah Construction",
    "project management construction",
  ],
  authors: [{ name: "Pegah Construction Ltd.", url: siteUrl }],
  creator: "Pegah Construction Ltd.",
  publisher: "Pegah Construction Ltd.",
  category: "construction",
  formatDetection: { telephone: true, address: true, email: true },
  openGraph: {
    type: "website",
    siteName: "Pegah Construction Ltd.",
    title: "Pegah Construction Ltd. | General Contractor in Ontario since 1988",
    description: DESCRIPTION,
    url: siteUrl,
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pegah Construction Ltd. | General Contractor in Ontario since 1988",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// Organization / local-business structured data (shown site-wide).
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  "@id": `${siteUrl}/#organization`,
  name: company.name,
  url: siteUrl,
  logo: `${siteUrl}/logo.webp`,
  image: `${siteUrl}/opengraph-image.png`,
  description: DESCRIPTION,
  foundingDate: company.established,
  telephone: company.phone,
  email: company.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: company.address.line1,
    addressLocality: "Toronto",
    addressRegion: "ON",
    postalCode: "M3H 5T5",
    addressCountry: "CA",
  },
  areaServed: { "@type": "State", name: "Ontario" },
  sameAs: [company.linkedin],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply the saved / system theme before paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
