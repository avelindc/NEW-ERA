"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, BUCKET_ASSETS, R2_PUBLIC_URL_ASSETS } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

export async function uploadCMSImageAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const ext = file.name.split('.').pop() || 'jpg';
    const key = `cms/${uuidv4()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: BUCKET_ASSETS,
      Key: key,
      Body: buffer,
      ContentType: file.type || "image/jpeg",
    });

    await r2Client.send(command);

    const publicBase = R2_PUBLIC_URL_ASSETS;
    const url = `${publicBase.replace(/\/$/, '')}/${key}`;
    console.log("CMS image uploaded successfully to R2:", url);
    return { url };
  } catch (error: any) {
    console.error("CMS Upload error:", error);
    return { error: error.message || "Failed to upload image to R2 storage" };
  }
}
