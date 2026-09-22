import sys

file_path = 'prisma/schema.prisma'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

old_str = """  title       String
  audioUrl    String
  isrc        String?
  upc         String?
  composer    String?
  producer    String?
  lyrics      String?
  tiktokClipStart String? // e.g. "00:30" or "01:15" """

new_str = """  title       String
  audioUrl    String
  isrc        String?
  upc         String?
  composer    String?
  producer    String?
  lyrics      String?
  tiktokClipStart String? // e.g. "00:30" or "01:15"
  featuredArtist  String? """

if old_str in code:
    code = code.replace(old_str, new_str)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched schema.prisma!")
else:
    print("Old string not found.")
