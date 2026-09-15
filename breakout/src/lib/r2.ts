import { S3Client } from "@aws-sdk/client-s3";

const DEFAULT_R2_ENDPOINT = "https://69becb9b62eb7ca72839b96d069cc630.r2.cloudflarestorage.com";
const DEFAULT_R2_ACCESS_KEY = "170acbe855e10b761fcfece6b9254a08";
const DEFAULT_R2_SECRET_KEY = "7f9bc8e849695c683b7ffde52449cc976379aff6a1254033a6b2d5e04d7a2543";

// Initialize R2 Client with Cloudflare R2 optimized configuration
export const r2Client = new S3Client({
  region: "auto", // R2 uses "auto" region
  endpoint: (process.env.R2_ENDPOINT || DEFAULT_R2_ENDPOINT).trim(),
  forcePathStyle: true, // Required for R2
  credentials: {
    accessKeyId: (process.env.R2_ACCESS_KEY_ID || DEFAULT_R2_ACCESS_KEY).trim(),
    secretAccessKey: (process.env.R2_SECRET_ACCESS_KEY || DEFAULT_R2_SECRET_KEY).trim(),
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  maxAttempts: 3,
  retryMode: "adaptive",
});

// Bucket configurations
export const BUCKET_ASSETS = process.env.R2_BUCKET_ASSETS || "assets";
export const BUCKET_PROFILES = process.env.R2_BUCKET_PROFILES || "profiles";
export const BUCKET_RELEASES = process.env.R2_BUCKET_RELEASES || "releases";

// Public URLs for buckets
export const R2_PUBLIC_URL_ASSETS = process.env.NEXT_PUBLIC_R2_PUBLIC_URL_ASSETS || "https://assets.breakoutmusicrecord.com";
export const R2_PUBLIC_URL_PROFILES = process.env.NEXT_PUBLIC_R2_PUBLIC_URL_PROFILES || "https://profiles.breakoutmusicrecord.com";
export const R2_PUBLIC_URL_RELEASES = process.env.NEXT_PUBLIC_R2_PUBLIC_URL_RELEASES || "https://releases.breakoutmusicrecord.com";

// Helper function to resolve any R2 file to /api/media streaming URL
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/api/media/")) return url;
  if (url.startsWith("/")) return url;
  
  // If it is an R2 custom domain URL or full storage URL, route via /api/media
  if (
    url.includes("breakoutmusicrecord.com") ||
    url.includes("breakoutmusic.online") ||
    url.includes("r2.cloudflarestorage.com")
  ) {
    try {
      const u = new URL(url);
      const key = u.pathname.replace(/^\/+/, "");
      return `/api/media/${key}`;
    } catch {
      const key = url.replace(/^https?:\/\/[^\/]+\//, "");
      return `/api/media/${key}`;
    }
  }
  return url;
}

export function validateR2Config(): { isValid: boolean; error?: string } {
  const endpoint = process.env.R2_ENDPOINT || DEFAULT_R2_ENDPOINT;
  const accessKey = process.env.R2_ACCESS_KEY_ID || DEFAULT_R2_ACCESS_KEY;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY || DEFAULT_R2_SECRET_KEY;

  if (!endpoint) {
    return { isValid: false, error: "R2_ENDPOINT is not configured" };
  }
  if (!accessKey) {
    return { isValid: false, error: "R2_ACCESS_KEY_ID is not configured" };
  }
  if (!secretKey) {
    return { isValid: false, error: "R2_SECRET_ACCESS_KEY is not configured" };
  }
  return { isValid: true };
}