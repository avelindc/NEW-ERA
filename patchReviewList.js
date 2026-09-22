const fs = require('fs');
let code = fs.readFileSync('src/app/admin/releases/ReviewList.tsx', 'utf-8');

// Add tiktokClipStart to interface
code = code.replace(
    'producer?: string | null;\n    lyrics?: string | null;\n  }',
    'producer?: string | null;\n    lyrics?: string | null;\n    tiktokClipStart?: string | null;\n  }'
);

// Add tiktokClipStart render
code = code.replace(
    '{track.producer && <span className="block text-[11px]">Producer: <span className="text-slate-600 font-medium">{track.producer}</span></span>}\n                              </div>',
    '{track.producer && <span className="block text-[11px]">Producer: <span className="text-slate-600 font-medium">{track.producer}</span></span>}\n                                {track.tiktokClipStart && <span className="block text-[11px]">TikTok Clip: <span className="text-slate-600 font-medium">{track.tiktokClipStart}</span></span>}\n                              </div>'
);

fs.writeFileSync('src/app/admin/releases/ReviewList.tsx', code);
console.log('Patched ReviewList!');
