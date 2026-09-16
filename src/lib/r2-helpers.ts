"use server";

import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cookies } from "next/headers";
import { 
  r2Client, 
  BUCKET_RELEASES, 
  BUCKET_PROFILES, 
  BUCKET_ASSETS,
  R2_PUBLIC_URL_RELEASES,
  R2_PUBLIC_URL_PROFILES,
  R2_PUBLIC_URL_ASSETS,
  validateR2Config
} from "./r2";

/**
 * Generate presigned upload URL for R2
 * @param bucket - R2 bucket name
 * @param key - File key/path in bucket
 * @param contentType - MIME type of the file (from frontend)
 * @param expiresIn - URL expiration time in seconds (default: 900 = 15 minutes)
 */
export async function generateR2PresignedUploadUrl(
  bucket: string,
  key: string,
  contentType: string,
  expiresIn: number = 900 // 15 minutes
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate R2 configuration
    const validation = validateR2Config();
    if (!validation.isValid) {
      return { success: false, error: `R2 Configuration Error: ${validation.error}` };
    }

    // Create PutObjectCommand for universal upload
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { 
      expiresIn,
    });

    return { success: true, url: signedUrl };
  } catch (error: any) {
    console.error("Error generating R2 presigned upload URL:", error);
    return { success: false, error: error.message || "Failed to generate upload URL" };
  }
}

/**
 * Generate presigned download URL for R2
 * @param bucket - R2 bucket name
 * @param key - File key/path in bucket
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 */
export async function generateR2PresignedDownloadUrl(
  bucket: string,
  key: string,
  expiresIn: number = 3600 // 1 hour
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const validation = validateR2Config();
    if (!validation.isValid) {
      return { success: false, error: `R2 Configuration Error: ${validation.error}` };
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });

    return { success: true, url: signedUrl };
  } catch (error: any) {
    console.error("Error generating R2 presigned download URL:", error);
    return { success: false, error: error.message || "Failed to generate download URL" };
  }
}

/**
 * Get public URL for R2 file using custom domain
 * @param bucket - R2 bucket name
 * @param key - File key/path in bucket
 */
export async function getR2PublicUrl(bucket: string, key: string): Promise<string> {
  let baseUrl = "";
  
  switch (bucket) {
    case BUCKET_RELEASES:
      baseUrl = R2_PUBLIC_URL_RELEASES;
      break;
    case BUCKET_PROFILES:
      baseUrl = R2_PUBLIC_URL_PROFILES;
      break;
    case BUCKET_ASSETS:
      baseUrl = R2_PUBLIC_URL_ASSETS;
      break;
    default:
      throw new Error(`Unknown bucket: ${bucket}`);
  }

  if (!baseUrl) {
    throw new Error(`Public URL not configured for bucket: ${bucket}`);
  }

  // Ensure key doesn't start with slash and baseUrl doesn't end with slash
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBaseUrl}/${cleanKey}`;
}

/**
 * Delete file from R2
 * @param bucket - R2 bucket name
 * @param key - File key/path in bucket
 */
export async function deleteR2File(
  bucket: string, 
  key: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = validateR2Config();
    if (!validation.isValid) {
      return { success: false, error: `R2 Configuration Error: ${validation.error}` };
    }

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await r2Client.send(command);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting R2 file:", error);
    return { success: false, error: error.message || "Failed to delete file" };
  }
}

/**
 * Upload file directly to API route (server-side upload)
 * @param file - File object to upload
 * @param uploadType - Type of upload ('cover', 'audio', 'profile', 'asset', etc.)
 * @param artistId - Optional artist ID for file naming
 */
export async function uploadFileToAPI(
  file: File,
  uploadType: string,
  artistId?: string
): Promise<{ success: boolean; url?: string; error?: string; key?: string }> {
  try {
    let bucket: string;
    let folder: string;

    switch (uploadType) {
      case 'cover':
        bucket = BUCKET_RELEASES;
        folder = 'covers';
        break;
      case 'audio':
        bucket = BUCKET_RELEASES;
        folder = 'audio';
        break;
      case 'profile':
        bucket = BUCKET_PROFILES;
        folder = 'avatars';
        break;
      case 'asset':
      case 'cms':
      case 'brand':
        bucket = BUCKET_ASSETS;
        folder = uploadType === 'brand' ? 'brand' : 'cms';
        break;
      case 'message':
        bucket = BUCKET_ASSETS;
        folder = 'messages';
        break;
      case 'contract':
        bucket = BUCKET_ASSETS;
        folder = uploadType === 'signature' ? 'signatures' : 'contracts';
        break;
      default:
        return { success: false, error: "Invalid upload type" };
    }

    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'tmp';
    const identifier = artistId || 'upload';
    const filename = `${identifier}-${timestamp}.${ext}`;
    const key = `${folder}/${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(command);

    const url = await getR2PublicUrl(bucket, key);
    return { success: true, url, key };

  } catch (error: any) {
    console.error(`[uploadFileToAPI] Failed to upload to R2 directly:`, error);
    return { success: false, error: error.message || "Failed to upload file" };
  }
}
