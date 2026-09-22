const fs = require('fs');
let code = fs.readFileSync('src/app/admin/releases/ReviewList.tsx', 'utf-8');

const target1 = '<span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">\r\n                      {selected.type}\r\n                    </span>';
const replacement1 = <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
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
                    )};

const target2 = '<p className="text-xs text-slate-400">\r\n                              {track.isrc ? \ISRC: \\ : "ISRC Auto-Generated"}\r\n                            </p>';
const replacement2 = <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                              <span className="inline-block font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mr-2 mb-1">
                                {track.isrc ? \ISRC: \\ : "ISRC Auto-Generated"}
                              </span>
                              {track.upc && (
                                <span className="inline-block font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mr-2 mb-1">
                                  UPC: {track.upc}
                                </span>
                              )}
                              {track.composer && <span className="block text-[11px]">Composer: <span className="text-slate-600 font-medium">{track.composer}</span></span>}
                              {track.producer && <span className="block text-[11px]">Producer: <span className="text-slate-600 font-medium">{track.producer}</span></span>}
                            </div>;

code = code.replace(target1, replacement1);
code = code.replace(target1.replace(/\r\n/g, '\n'), replacement1);
code = code.replace(target2, replacement2);
code = code.replace(target2.replace(/\r\n/g, '\n'), replacement2);

fs.writeFileSync('src/app/admin/releases/ReviewList.tsx', code);
