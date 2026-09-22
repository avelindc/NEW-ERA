import sys

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()

    if 'import { resolveMediaUrl }' not in code:
        code = code.replace('import { PrismaClient } from "@prisma/client";', 'import { PrismaClient } from "@prisma/client";\nimport { resolveMediaUrl } from "@/lib/r2";')
        
    code = code.replace(
        'const brandLogo = brandSetting?.value || "/logo.png";',
        'const brandLogo = resolveMediaUrl(brandSetting?.value) || "/logo.png";'
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(code)

patch_file('src/app/admin/layout.tsx')
patch_file('src/app/dashboard/layout.tsx')
print("Patched layouts!")
