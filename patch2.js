const fs = require('fs');
let code = fs.readFileSync('src/app/admin/releases/ReviewList.tsx', 'utf-8');

const regex1 = /<span className="px-2\.5 py-0\.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">[\s\S]*?\{selected\.type\}[\s\S]*?<\/span>/;
const replacement1 = `<div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
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
                      )}
                    </div>`;

const regex2 = /<p className="text-xs text-slate-400">[\s\S]*?\{track\.isrc \? `ISRC: \$\{track\.isrc\}` : "ISRC Auto-Generated"\}[\s\S]*?<\/p>/;
const replacement2 = `<div className="text-xs text-slate-400 mt-1 space-y-0.5">
                              <span className="inline-block font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mr-2 mb-1">
                                {track.isrc ? \`ISRC: \${track.isrc}\` : "ISRC Auto-Generated"}
                              </span>
                              {track.upc && (
                                <span className="inline-block font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mr-2 mb-1">
                                  UPC: {track.upc}
                                </span>
                              )}
                              {track.composer && <span className="block text-[11px]">Composer: <span className="text-slate-600 font-medium">{track.composer}</span></span>}
                              {track.producer && <span className="block text-[11px]">Producer: <span className="text-slate-600 font-medium">{track.producer}</span></span>}
                            </div>`;

code = code.replace(regex1, replacement1);
code = code.replace(regex2, replacement2);

fs.writeFileSync('src/app/admin/releases/ReviewList.tsx', code);
