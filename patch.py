import sys

with open('src/app/admin/releases/ReviewList.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace 1
target1 = """<span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                      {selected.type}
                    </span>"""
replacement1 = """<span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                      {selected.type}
                    </span>
                    {selected.upc && (
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-200">
                        UPC: {selected.upc}
                      </span>
                    )}
                    {selected.featuredArtist && (
                      <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-md border border-purple-200">
                        Feat: {selected.featuredArtist}
                      </span>
                    )}"""

# Replace 2
target2 = """<p className="text-xs text-slate-400">
                              {track.isrc ? `ISRC: ${track.isrc}` : "ISRC Auto-Generated"}
                            </p>"""
replacement2 = """<div className="text-xs text-slate-400 mt-1 space-y-0.5">
                              <span className="inline-block font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mr-2 mb-1">
                                {track.isrc ? `ISRC: ${track.isrc}` : "ISRC Auto-Generated"}
                              </span>
                              {track.upc && (
                                <span className="inline-block font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mr-2 mb-1">
                                  UPC: {track.upc}
                                </span>
                              )}
                              {track.composer && <span className="block text-[11px]">Composer: <span className="text-slate-600 font-medium">{track.composer}</span></span>}
                              {track.producer && <span className="block text-[11px]">Producer: <span className="text-slate-600 font-medium">{track.producer}</span></span>}
                            </div>"""

# Replace Windows newlines with Unix newlines for consistency in matching
code = code.replace('\r\n', '\n')
target1 = target1.replace('\r\n', '\n')
replacement1 = replacement1.replace('\r\n', '\n')
target2 = target2.replace('\r\n', '\n')
replacement2 = replacement2.replace('\r\n', '\n')

code = code.replace(target1, replacement1)
code = code.replace(target2, replacement2)

with open('src/app/admin/releases/ReviewList.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
