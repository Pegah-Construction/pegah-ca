import type { MetadataRoute } from "next";
import { company } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: company.name,
    short_name: "Pegah",
    description: "General contracting & project management serving Ontario since 1988.",
    start_url: "/",
    display: "standalone",
    background_color: "#12224f",
    theme_color: "#12224f",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
