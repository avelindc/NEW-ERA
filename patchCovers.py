import os
import re

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()

    original_code = code

    # Add import if needed
    if 'resolveMediaUrl' not in code and ('cover' in code or 'coverArtworkUrl' in code):
        code = 'import { resolveMediaUrl } from "@/lib/r2";\n' + code
        
    code = re.sub(r'src=\{([^}]*?\.cover)\}', lambda m: m.group(0).replace(m.group(1), f'resolveMediaUrl({m.group(1)})') if 'resolveMediaUrl' not in m.group(1) else m.group(0), code)
    code = re.sub(r'src=\{([^}]*?\.coverArtworkUrl)\}', lambda m: m.group(0).replace(m.group(1), f'resolveMediaUrl({m.group(1)})') if 'resolveMediaUrl' not in m.group(1) else m.group(0), code)

    if code != original_code:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Fixed: {file_path}")

fix_file('src/app/dashboard/streaming/StreamingClient.tsx')
fix_file('src/app/admin/streaming/AdminStreamingClient.tsx')
fix_file('src/app/dashboard/releases/[id]/page.tsx')
fix_file('src/app/admin/existing-releases/page.tsx')
fix_file('src/app/admin/artists/[id]/ArtistDetailClient.tsx')

print("Done patching cover URLs!")
