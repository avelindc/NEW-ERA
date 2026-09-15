import { S3Client } from "@aws-sdk/client-s3";

const DEFAULT_R2_ENDPOINT = "https://c1aaf27f910711776d0d2b338cc1ce46.r2.cloudflarestorage.com";
const DEFAULT_R2_ACCESS_KEY = "3384292b6cb558565fc12f01f8faf8c8";
const DEFAULT_R2_SECRET_KEY = "f0e9f9f4528c55acc96be8fb0341eef81f62a6a4ebc8575291870c74b0c11633";

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
  
  // Additional R2-specific optimizations
  maxAttempts: 3,
  retryMode: "adaptive",
});

// Bucket configurations
export const BUCKET_ASSETS = process.env.R2_BUCKET_ASSETS || "assets";
export const BUCKET_PROFILES = process.env.R2_BUCKET_PROFILES || "profiles";
export const BUCKET_RELEASES = process.env.R2_BUCKET_RELEASES || "releases";

// Public URLs for buckets (using custom domains for security)
export const R2_PUBLIC_URL_ASSETS = process.env.NEXT_PUBLIC_R2_PUBLIC_URL_ASSETS || "https://assets.breakoutmusicrecord.com";
export const R2_PUBLIC_URL_PROFILES = process.env.NEXT_PUBLIC_R2_PUBLIC_URL_PROFILES || "https://profiles.breakoutmusicrecord.com";
export const R2_PUBLIC_URL_RELEASES = process.env.NEXT_PUBLIC_R2_PUBLIC_URL_RELEASES || "https://releases.breakoutmusicrecord.com";

// Validate R2 configuration
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
