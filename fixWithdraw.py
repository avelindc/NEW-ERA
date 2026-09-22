import sys

file_path = 'src/app/dashboard/withdraw/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Add import if needed
if 'resolveMediaUrl' not in code:
    code = 'import { resolveMediaUrl } from "@/lib/r2";\n' + code

code = code.replace("const profileImage = user?.image ||", "const profileImage = user?.image ? resolveMediaUrl(user.image) :")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
print("withdraw/page.tsx fixed!")
