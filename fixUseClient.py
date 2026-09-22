import os

def fix_use_client(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()

    if 'import { resolveMediaUrl } from "@/lib/r2";\n"use client";' in code:
        code = code.replace('import { resolveMediaUrl } from "@/lib/r2";\n"use client";', '"use client";\nimport { resolveMediaUrl } from "@/lib/r2";')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Fixed: {file_path}")

fix_use_client('src/app/dashboard/streaming/StreamingClient.tsx')
fix_use_client('src/app/admin/streaming/AdminStreamingClient.tsx')
