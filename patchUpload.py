import sys
import re

with open('src/lib/r2-helpers.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# We want to replace the body of uploadFileToAPI
target = re.search(r'export async function uploadFileToAPI\([^)]+\): Promise<\{ success: boolean; url\?: string; error\?: string; key\?: string \}> \{[\s\S]*$', code)

if target:
    original_rest = target.group(0)
    # The end of the file is the end of this function (it's the last function in the file currently, but let's be careful and just replace the whole function).
    pass

new_function = """export async function uploadFileToAPI(
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
"""

# replace everything from export async function uploadFileToAPI to the end of the file (assuming it's the last function)
code = re.sub(r'export async function uploadFileToAPI\([\s\S]*', new_function, code)

with open('src/lib/r2-helpers.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("Patched r2-helpers.ts with direct upload!")
