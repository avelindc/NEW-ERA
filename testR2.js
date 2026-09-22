const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const client = new S3Client({
  region: "auto",
  endpoint: "https://69becb9b62eb7ca72839b96d069cc630.r2.cloudflarestorage.com",
  forcePathStyle: true,
  credentials: {
    accessKeyId: "170acbe855e10b761fcfece6b9254a08",
    secretAccessKey: "7f9bc8e849695c683b7ffde52449cc976379aff6a1254033a6b2d5e04d7a2543"
  }
});

async function main() {
  try {
    const data = await client.send(new ListObjectsV2Command({ Bucket: 'assets', Prefix: 'brand/' }));
    console.log("Files in 'assets' bucket under 'brand/':");
    if (data.Contents) {
        data.Contents.forEach(c => console.log(c.Key, c.Size));
    } else {
        console.log("No files found.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
