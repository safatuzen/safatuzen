import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SafaTu Zen",
    short_name: "SafaTu Zen",
    description: "আপনার দৈনন্দিন প্রয়োজনের আস্থাশীল ঠিকানা",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF9FB",
    theme_color: "#FFF9FB",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
