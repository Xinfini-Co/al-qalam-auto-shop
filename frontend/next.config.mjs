/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The `@shared` package is type-only, so nothing is bundled from it at
  // runtime. Listing it here keeps things working if runtime exports are
  // ever added to /shared later.
  transpilePackages: ["@aqas/shared"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
