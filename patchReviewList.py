import sys
import re

with open('src/app/admin/releases/ReviewList.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add tiktokClipStart to interface
code = re.sub(
    r'producer\?: string \| null;\s*lyrics\?: string \| null;\s*\}',
    r'producer?: string | null;\n    lyrics?: string | null;\n    tiktokClipStart?: string | null;\n  }',
    code
)

# Add tiktokClipStart render
code = re.sub(
    r'(\{track\.producer && <span className="block text-\[11px\]">Producer: <span className="text-slate-600 font-medium">\{track\.producer\}</span></span>\}\n\s*)</div>',
    r'\1  {track.tiktokClipStart && <span className="block text-[11px]">TikTok Clip: <span className="text-slate-600 font-medium">{track.tiktokClipStart}</span></span>}\n                              </div>',
    code
)

with open('src/app/admin/releases/ReviewList.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Patched ReviewList with Python!")
