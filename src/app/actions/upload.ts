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

export async function getPresignedUploadUrlAction({
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

  const presigned = await generateR2PresignedUploadUrl(bucket, key, contentType || (type === "audio" ? "audio/mpeg" : "image/jpeg"), 1800);
  if (!presigned.success || !presigned.url) {
    return { error: presigned.error || "Gagal membuat URL upload R2" };
  }

  return {
    success: true,
    uploadUrl: presigned.url,
    publicUrl,
    key,
    bucket
  };
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
