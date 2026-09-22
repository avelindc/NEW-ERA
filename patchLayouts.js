const fs = require('fs');

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf-8');
  
  if (!code.includes('import { resolveMediaUrl }')) {
    code = code.replace(/import \{ PrismaClient \} from "@prisma\/client";/, 'import { PrismaClient } from "@prisma/client";\nimport { resolveMediaUrl } from "@/lib/r2";');
    if (!code.includes('import { resolveMediaUrl }')) {
      code = code.replace(/import \{ auth \} from "@/auth";/, 'import { auth } from "@/auth";\nimport { resolveMediaUrl } from "@/lib/r2";');
    }
  }

  code = code.replace(
    /const brandLogo = brandSetting\?\.value \|\| "\/logo\.png";/,
    'const brandLogo = resolveMediaUrl(brandSetting?.value) || "/logo.png";'
  );
  
  fs.writeFileSync(filepath, code);
}

patchFile('src/app/admin/layout.tsx');
patchFile('src/app/dashboard/layout.tsx');
console.log('Patched layouts!');
