import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, BUCKET_RELEASES, BUCKET_ASSETS, BUCKET_PROFILES } from "@/lib/r2";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const filename = searchParams.get("filename") || "download";

    if (!url) {
      return new NextResponse("Missing URL", { status: 400 });
    }

    // Extract R2 key from URL or path
    let key = url;
    if (key.includes("://")) {
      try {
        const u = new URL(key);
        key = u.pathname.replace(/^\/+/, "");
      } catch {
        key = url.replace(/^https?:\/\/[^\/]+\//, "");
      }
    }

    let bucketsToTry = [BUCKET_RELEASES, BUCKET_ASSETS, BUCKET_PROFILES];
    if (key.startsWith("cms/") || key.startsWith("assets/")) {
      bucketsToTry = [BUCKET_ASSETS, BUCKET_RELEASES, BUCKET_PROFILES];
    } else if (key.startsWith("profiles/")) {
      bucketsToTry = [BUCKET_PROFILES, BUCKET_RELEASES, BUCKET_ASSETS];
    }

    let responseData: any = null;

    for (const bucket of bucketsToTry) {
      try {
        const cmd = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        });
        const res = await r2Client.send(cmd);
        if (res && res.Body) {
          responseData = res;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    if (responseData && responseData.Body) {
      const bytes = await responseData.Body.transformToByteArray();
      const contentType = responseData.ContentType || "application/octet-stream";
      const cleanFilename = encodeURIComponent(filename).replace(/['()]/g, escape);

      return new NextResponse(Buffer.from(bytes), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${cleanFilename}`,
          "Content-Length": bytes.length.toString(),
          "Cache-Control": "no-cache",
        },
      });
    }

    // Fallback direct fetch if not in R2
    let res = await fetch(url);
    if (!res.ok) {
      return NextResponse.redirect(url, 302);
    }

    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const cleanFilename = encodeURIComponent(filename).replace(/['()]/g, escape);

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${cleanFilename}`,
        "Content-Length": arrayBuffer.byteLength.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    const { searchParams } = new URL(request.url);
    const fallbackUrl = searchParams.get("url");
    if (fallbackUrl) {
      return NextResponse.redirect(fallbackUrl, 302);
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}