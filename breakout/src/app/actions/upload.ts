"use server";

import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { isMaintenanceActive } from "@/lib/maintenance";
import { sendTelegramReleaseNotification } from "@/lib/telegramBot";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, BUCKET_RELEASES, BUCKET_ASSETS, BUCKET_PROFILES, R2_PUBLIC_URL_ASSETS, R2_PUBLIC_URL_RELEASES, R2_PUBLIC_URL_PROFILES } from "@/lib/r2";
import { generateR2PresignedUploadUrl } from "@/lib/r2-helpers";

const prisma = new PrismaClient();

import { 
  CreateMultipartUploadCommand, 
  UploadPartCommand, 
  CompleteMultipartUploadCommand 
} from "@aws-sdk/client-s3";

export async function initiateMultipartUploadAction({
  filename,
  contentType,
  type,
  artistId
}: {
  filename: string;
  contentType: string;
  type: "cover" | "audio" | "profile" | "cms";
  artistId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const timestamp = Date.now();
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const ext = cleanFilename.split(".").pop() || (type === "audio" ? "mp3" : "jpg");

  let bucket = BUCKET_ASSETS;
  let key = "";
  let publicUrl = "";

  if (type === "cover") {
    bucket = BUCKET_ASSETS;
    key = `covers/${artistId || session.user.id}-${timestamp}.${ext}`;
    publicUrl = `${R2_PUBLIC_URL_ASSETS.replace(/\/$/, "")}/${key}`;
  } else if (type === "audio") {
    bucket = BUCKET_RELEASES;
    key = `audio/${artistId || session.user.id}-${timestamp}.${ext}`;
    publicUrl = `${R2_PUBLIC_URL_RELEASES.replace(/\/$/, "")}/${key}`;
  } else if (type === "cms") {
    bucket = BUCKET_ASSETS;
    key = `cms/${session.user.id}-${timestamp}.${ext}`;
    publicUrl = `${R2_PUBLIC_URL_ASSETS.replace(/\/$/, "")}/${key}`;
  } else {
    bucket = BUCKET_PROFILES;
    key = `profiles/${session.user.id}-${timestamp}.${ext}`;
    publicUrl = `${R2_PUBLIC_URL_PROFILES.replace(/\/$/, "")}/${key}`;
  }

  try {
    const initRes = await r2Client.send(new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType || (type === "audio" ? "audio/mpeg" : "image/jpeg")
    }));

    return {
      success: true,
      uploadId: initRes.UploadId,
      key,
      bucket,
      publicUrl
    };
  } catch (err: any) {
    console.error("initiateMultipartUploadAction error:", err);
    return { error: err.message || "Failed to initialize upload" };
  }
}

export async function uploadPartAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const bucket = formData.get("bucket") as string;
    const key = formData.get("key") as string;
    const uploadId = formData.get("uploadId") as string;
    const partNumber = parseInt(formData.get("partNumber") as string, 10);
    const chunkFile = formData.get("chunk") as File;

    if (!bucket || !key || !uploadId || !partNumber || !chunkFile) {
      return { error: "Missing required chunk parameters" };
    }

    const chunkBuffer = Buffer.from(await chunkFile.arrayBuffer());

    const partRes = await r2Client.send(new UploadPartCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: chunkBuffer
    }));

    return {
      success: true,
      etag: partRes.ETag,
      partNumber
    };
  } catch (err: any) {
    console.error("uploadPartAction error:", err);
    return { error: err.message || "Failed to upload chunk" };
  }
}

export async function completeMultipartUploadAction({
  bucket,
  key,
  uploadId,
  parts,
  publicUrl
}: {
  bucket: string;
  key: string;
  uploadId: string;
  parts: { PartNumber: number; ETag: string }[];
  publicUrl: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Sort parts by PartNumber ascending
    const sortedParts = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);

    await r2Client.send(new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: sortedParts
      }
    }));

    return {
      success: true,
      publicUrl
    };
  } catch (err: any) {
    console.error("completeMultipartUploadAction error:", err);
    return { error: err.message || "Failed to complete upload" };
  }
}

export async function directUploadSmallFileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "cover";
    const artistId = formData.get("artistId") as string;

    if (!file) {
      return { error: "No file provided" };
    }

    const timestamp = Date.now();
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const ext = cleanFilename.split(".").pop() || (type === "audio" ? "mp3" : "jpg");

    let bucket = BUCKET_ASSETS;
    let key = "";
    let publicUrl = "";

    if (type === "cover") {
      bucket = BUCKET_ASSETS;
      key = `covers/${artistId || session.user.id}-${timestamp}.${ext}`;
      publicUrl = `${R2_PUBLIC_URL_ASSETS.replace(/\/$/, "")}/${key}`;
    } else if (type === "audio") {
      bucket = BUCKET_RELEASES;
      key = `audio/${artistId || session.user.id}-${timestamp}.${ext}`;
      publicUrl = `${R2_PUBLIC_URL_RELEASES.replace(/\/$/, "")}/${key}`;
    } else if (type === "cms") {
      bucket = BUCKET_ASSETS;
      key = `cms/${session.user.id}-${timestamp}.${ext}`;
      publicUrl = `${R2_PUBLIC_URL_ASSETS.replace(/\/$/, "")}/${key}`;
    } else {
      bucket = BUCKET_PROFILES;
      key = `profiles/${session.user.id}-${timestamp}.${ext}`;
      publicUrl = `${R2_PUBLIC_URL_PROFILES.replace(/\/$/, "")}/${key}`;
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    await r2Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || (type === "audio" ? "audio/mpeg" : "image/jpeg")
    }));

    return {
      success: true,
      publicUrl
    };
  } catch (err: any) {
    console.error("directUploadSmallFileAction error:", err);
    return { error: err.message || "Failed to direct upload file" };
  }
}



export async function submitMusicMetadataAction(data: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const active = await isMaintenanceActive();
  if (active && session?.user?.role !== "ADMIN") {
    return { error: "Sistem sedang dalam pemeliharaan (Maintenance Mode)." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { artists: true }
  });

  if (!user || user.artists.length === 0) {
    return { error: "No artist profile found. Please create an artist first." };
  }

  try {
    const {
      title,
      genre,
      language,
      primaryArtistId,
      featuredArtist,
      composer,
      producer,
      lyrics,
      isrc,
      upc,
      releaseDateStr,
      tiktokClipStart,
      coverUrl,
      audioUrl
    } = data;
    
    // Validate URLs are provided
    if (!coverUrl || !audioUrl) {
      return { error: "Cover and audio URLs are required" };
    }

    // Find the specific artist the user selected
    const selectedArtist = user.artists.find((a: any) => a.id === primaryArtistId);
    if (!selectedArtist) {
      return { error: "Invalid artist selected." };
    }
    
    const primaryArtist = selectedArtist.stageName;
    const releaseDate = new Date(releaseDateStr);
    
    if (!title || !genre || !language || !releaseDateStr) {
      return { error: "Missing required fields" };
    }

    // Use the URLs provided from server-side upload
    console.log("=== SAVING TO DATABASE ===");
    console.log("Cover URL:", coverUrl);
    console.log("Audio URL:", audioUrl);

    try {
      // Create Release & Track in DB
      const release = await prisma.release.create({
        data: {
          artistId: selectedArtist.id,
          title,
          type: "SINGLE",
          genre,
          language,
          primaryArtist,
          featuredArtist,
          releaseDate,
          coverArtworkUrl: coverUrl,
          status: "PENDING",
          tracks: {
            create: {
              title,
              audioUrl,
              composer,
              producer,
              lyrics,
              isrc,
              upc,
              tiktokClipStart
            }
          }
        }
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/releases");
      revalidatePath("/admin/releases");

      // Send Telegram Notification and save message ID
      const telegramMessageId = await sendTelegramReleaseNotification(
        release.id,
        primaryArtist,
        title,
        session.user.email || "Unknown",
        releaseDateStr,
        coverUrl,
        audioUrl,
        upc || "",
        isrc || "",
        composer || ""
      ).catch(e => {
        console.error("Telegram notify err:", e);
        return null;
      });

      if (telegramMessageId) {
        await prisma.release.update({
          where: { id: release.id },
          data: { telegramMessageId: telegramMessageId.toString() }
        });
      }

      return { success: true, releaseId: release.id };
    } catch (error: any) {
      console.error("submitMusicMetadataAction Error:", error);
      return { error: `Server Database Error: ${error.message || "Unknown error"}` };
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return { error: error.message || "Failed to upload release" };
  }
}
