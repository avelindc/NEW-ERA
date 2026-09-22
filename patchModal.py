import sys
import re

file_path = 'src/components/UploadForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

new_modal = """        {/* NEW ARTIST MODAL */}
        {showNewArtistModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 shadow-2xl w-full max-w-md p-6 relative animate-scale-in rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Tambah Profil Artis Baru</h3>
              <form onSubmit={handleCreateArtist}>
                <div className="mb-4">
                  <label className="block text-sm text-slate-300 mb-1">Nama Panggung / Stage Name</label>
                  <input 
                    type="text" 
                    value={newArtistName} 
                    onChange={(e) => setNewArtistName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nama artis"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowNewArtistModal(false)} className="px-4 py-2 text-slate-300 hover:text-white transition">
                    Batal
                  </button>
                  <button type="submit" disabled={creatingArtist || !newArtistName.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 flex items-center gap-2 rounded-xl transition font-medium">
                    {creatingArtist ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                    Simpan Artis
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}"""

# Replace anything from {/* NEW ARTIST MODAL */} to the end of the file except the last </div>
pattern = r'\{\/\*\s*NEW ARTIST MODAL\s*\*\/\}.*?(?=    </div>\s*<)/s'
# Actually since I know where it is, I can use a simpler regex
pattern = re.compile(r'\{\/\*\s*NEW ARTIST MODAL\s*\*\/\}.*?\}\)', re.DOTALL)

if pattern.search(code):
    code = pattern.sub(new_modal, code)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched Modal!")
else:
    print("Not found.")
