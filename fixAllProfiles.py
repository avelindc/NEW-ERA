import sys
import re
import os
import glob

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()

    original_code = code

    # Add import if needed
    if 'user.image' in code or 'avatarUrl' in code:
        if 'resolveMediaUrl(' not in code:
            if 'import' in code:
                # find last import
                last_import_pos = code.rfind('\nimport ')
                end_of_line = code.find('\n', last_import_pos + 1)
                code = code[:end_of_line] + '\nimport { resolveMediaUrl } from "@/lib/r2";' + code[end_of_line:]
            else:
                code = 'import { resolveMediaUrl } from "@/lib/r2";\n' + code

        # Patterns to replace:
        # src={user.image || ...}
        # src={artist.avatarUrl || ...}
        # src={r.artist.avatarUrl || ...}
        code = re.sub(r'src=\{([^}]*(?:user\.image|avatarUrl)[^}]*)\}', 
            lambda m: m.group(0) if 'resolveMediaUrl' in m.group(1) 
            else m.group(0).replace('user.image', 'resolveMediaUrl(user.image)').replace('avatarUrl', 'resolveMediaUrl(avatarUrl)').replace('artist.resolveMediaUrl(avatarUrl)', 'resolveMediaUrl(artist.avatarUrl)'), code)
        
        # fix artist.avatarUrl replacing
        code = code.replace('artist.resolveMediaUrl(avatarUrl)', 'resolveMediaUrl(artist.avatarUrl)')
        code = code.replace('user?.image', 'resolveMediaUrl(user?.image)')
        
        # For variable declarations like const profileImage = user?.image || ...
        code = re.sub(r'(const \w+\s*=\s*)(user(?:\?)?\.image|[^;]*avatarUrl[^;]*)(.*;)', 
            lambda m: f"{m.group(1)}resolveMediaUrl({m.group(2).replace('resolveMediaUrl(resolveMediaUrl(', 'resolveMediaUrl(')}){m.group(3)}" if 'resolveMediaUrl' not in m.group(2) else m.group(0), code)

    if code != original_code:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Fixed: {file_path}")

# Run recursively on src folder
for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            fix_file(os.path.join(root, file))

print("All files processed!")
