import sys
import re

file_path = 'prisma/schema.prisma'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Replace with regex
pattern = re.compile(r'(title\s+String.*?tiktokClipStart\s+String\?.*?\n)', re.DOTALL)
if pattern.search(code):
    code = pattern.sub(r'\1    featuredArtist  String?\n', code)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched schema.prisma!")
else:
    print("Not found.")
