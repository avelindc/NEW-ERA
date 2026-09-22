import sys

file_path = 'src/components/UserSettingsForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('useState<string | null>(user.image || null);', 'useState<string | null>(user.image ? resolveMediaUrl(user.image) : null);')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
print("State initialization fixed!")
