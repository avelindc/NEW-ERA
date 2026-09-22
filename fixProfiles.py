import sys
import re

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()

    # Add import if needed
    if 'resolveMediaUrl' not in code:
        if 'import' in code:
            # find last import
            last_import_pos = code.rfind('\nimport ')
            end_of_line = code.find('\n', last_import_pos + 1)
            code = code[:end_of_line] + '\nimport { resolveMediaUrl } from "@/lib/r2";' + code[end_of_line:]
        else:
            code = 'import { resolveMediaUrl } from "@/lib/r2";\n' + code

    # Replace user.image in img src tags
    # For UserOverviewClient:
    # <img src={user.image || `...`}
    code = re.sub(r'src=\{user\.image \|\| `(.*?)`\}', r'src={resolveMediaUrl(user.image) || `\1`}', code)

    # For UserSettingsForm:
    # <img src={preview}
    # wait, preview is already resolveMediaUrl(user.image) if we change state initialization!
    # const [preview, setPreview] = useState<string | null>(user.image ? resolveMediaUrl(user.image) : null);
    # Actually, preview is updated to blob URL, so it's fine.
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)

fix_file('src/app/dashboard/UserOverviewClient.tsx')
fix_file('src/components/UserSettingsForm.tsx')
print("Fixed files!")
