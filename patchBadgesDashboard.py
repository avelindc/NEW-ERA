import sys
import re

with open('src/app/dashboard/releases/UserReleasesClient.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace rel.type span
new_rel_type = """{rel.type === "SINGLE" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 mr-2">SINGLE</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200 mr-2">{rel.type}</span>
                          )}"""

code = re.sub(
    r'<span className="inline-flex items-center px-2 py-0\.5 rounded-md text-xs font-medium \s*bg-slate-100 text-slate-700 mr-2">\s*\{rel\.type\}\s*</span>',
    new_rel_type,
    code
)

# Replace selected.type span
new_selected_type = """{selectedRelease.type === "SINGLE" ? (
                      <span className="text-xs font-medium px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md">SINGLE</span>
                    ) : (
                      <span className="text-xs font-medium px-2.5 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 rounded-md">{selectedRelease.type}</span>
                    )}"""

code = re.sub(
    r'<span className="text-xs font-medium px-2\.5 py-0\.5 bg-slate-100 text-slate-600 rounded-md">\s*\{selectedRelease\.type\}\s*</span>',
    new_selected_type,
    code
)

with open('src/app/dashboard/releases/UserReleasesClient.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Patched UserReleasesClient.tsx for badges!")
