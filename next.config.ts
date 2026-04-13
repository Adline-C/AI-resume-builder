import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 experimental: {
  serverActions: {
    bodySizeLimit: "4mb",
  },
 },
 images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "a6djk6g3chdp8ovw.public.blob.vercel-storage.com"
    }
  ]
 }
};

export default nextConfig;
