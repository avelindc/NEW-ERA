import sys
import re

with open('src/app/admin/releases/ReviewList.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace rel.type span
new_rel_type = """{rel.type === "SINGLE" ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold mr-1.5">SINGLE</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-semibold mr-1.5 border border-purple-200">{rel.type}</span>
                          )}"""

code = re.sub(
    r'<span className="px-2 py-0\.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold \s*mr-1\.5">\s*\{rel\.type\}\s*</span>',
    new_rel_type,
    code
)

# Replace selected.type span
new_selected_type = """{selected.type === "SINGLE" ? (
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">SINGLE</span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-md border border-purple-200">{selected.type}</span>
                        )}"""

code = re.sub(
    r'<span className="px-2\.5 py-0\.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">\s*\{selected\.type\}\s*</span>',
    new_selected_type,
    code
)

with open('src/app/admin/releases/ReviewList.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Patched ReviewList.tsx for badges!")
