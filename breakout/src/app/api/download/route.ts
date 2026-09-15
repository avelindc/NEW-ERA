import { NextResponse } from "next/server";
import { auth } from "@/auth";

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

    // Fetch the file from Cloudflare R2
    const res = await fetch(url);
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
    console.error("Proxy download error:", error);
    // Fallback redirect
    const { searchParams } = new URL(request.url);
    const fallbackUrl = searchParams.get("url");
    if (fallbackUrl) {
      return NextResponse.redirect(fallbackUrl, 302);
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

