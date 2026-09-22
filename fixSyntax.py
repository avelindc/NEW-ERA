import sys

def fix_file(file_path, old_str, new_str):
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()
    code = code.replace(old_str, new_str)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)

fix_file('src/app/page.tsx', 'testi.resolveMediaUrl(avatarUrl)', 'resolveMediaUrl(testi.avatarUrl)')
fix_file('src/app/admin/all-artists/AllArtistsClient.tsx', 'artist.resolveMediaUrl(user.image)', 'resolveMediaUrl(artist.user.image)')
fix_file('src/app/dashboard/royalties/page.tsx', 'r.artist.resolveMediaUrl(user?.image)', 'resolveMediaUrl(r.artist.user?.image)')

print("Fixed syntax errors!")
