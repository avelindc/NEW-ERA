const fs = require('fs');
let code = fs.readFileSync('src/app/admin/releases/ReviewList.tsx', 'utf-8');
code = code.replace('<div className="mt-2 flex items-center gap-2">\r\n                      <div className="mt-2 flex items-center gap-2 flex-wrap">', '<div className="mt-2 flex items-center gap-2 flex-wrap">');
code = code.replace('<div className="mt-2 flex items-center gap-2">\n                      <div className="mt-2 flex items-center gap-2 flex-wrap">', '<div className="mt-2 flex items-center gap-2 flex-wrap">');
code = code.replace(/<\/span>\s*\}\)\s*\}\s*<\/div>\s*<button/, `</span>\n                    )}\n                    <button`);
fs.writeFileSync('src/app/admin/releases/ReviewList.tsx', code);
