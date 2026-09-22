import sys
import re

with open('src/app/actions/upload.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace submitMusicMetadataAction implementation
new_function = """export async function submitMusicMetadataAction(data: any) {
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
      type = "SINGLE",
      genre,
      language,
      primaryArtistId,
      releaseDateStr,
      coverUrl,
      tracks
    } = data;
    
    // Validate URLs are provided
    if (!coverUrl || !tracks || tracks.length === 0) {
      return { error: "Cover and at least one track are required" };
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

    try {
      // Create Release & Tracks in DB
      const release = await prisma.release.create({
        data: {
          artistId: selectedArtist.id,
          title,
          type,
          genre,
          language,
          primaryArtist,
          releaseDate,
          coverArtworkUrl: coverUrl,
          status: "PENDING",
          tracks: {
            create: tracks.map((t: any) => ({
              title: t.title || title,
              audioUrl: t.audioUrl,
              featuredArtist: t.featuredArtist || null,
              composer: t.composer || null,
              producer: t.producer || null,
              lyrics: t.lyrics || null,
              isrc: t.isrc || null,
              upc: t.upc || null,
              tiktokClipStart: t.tiktokClipStart || null
            }))
          }
        },
        include: { tracks: true }
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/releases");
      revalidatePath("/admin/releases");

      // For telegram notification, we summarize if it's an EP/ALBUM
      let trackSummary = title;
      let audioUrl = release.tracks[0]?.audioUrl || "";
      let composerInfo = release.tracks[0]?.composer || "";
      
      if (type !== "SINGLE" && tracks.length > 1) {
        trackSummary = `${title} (${type} - ${tracks.length} Tracks)`;
        composerInfo = `Various (${tracks.length} tracks)`;
      }

      // Send Telegram Notification and save message ID
      const telegramMessageId = await sendTelegramReleaseNotification(
        release.id,
        primaryArtist,
        trackSummary,
        session.user.email || "Unknown",
        releaseDateStr,
        coverUrl,
        audioUrl,
        "", // UPC at release level isn't passed here easily, left blank
        "", // ISRC left blank for albums
        composerInfo
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
"""

code = re.sub(r'export async function submitMusicMetadataAction[\s\S]*$', new_function, code)

with open('src/app/actions/upload.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated upload.ts")
