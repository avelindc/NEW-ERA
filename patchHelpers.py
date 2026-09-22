import sys

with open('src/lib/r2-helpers.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# Add cookies import if missing
if "from 'next/headers'" not in code and 'from "next/headers"' not in code:
    code = code.replace('import { getSignedUrl } from "@aws-sdk/s3-request-presigner";', 'import { getSignedUrl } from "@aws-sdk/s3-request-presigner";\nimport { cookies } from "next/headers";')

# Replace baseUrl logic
target1 = """    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';"""

replacement1 = """    const baseUrl = process.env.NEXTAUTH_URL 
      ? process.env.NEXTAUTH_URL 
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';"""

# Replace fetch logic
target2 = """    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary
    });"""

replacement2 = """    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': cookieHeader
      }
    });"""

code = code.replace('\r\n', '\n')
target1 = target1.replace('\r\n', '\n')
replacement1 = replacement1.replace('\r\n', '\n')
target2 = target2.replace('\r\n', '\n')
replacement2 = replacement2.replace('\r\n', '\n')

code = code.replace(target1, replacement1)
code = code.replace(target2, replacement2)

with open('src/lib/r2-helpers.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("Patched!")
