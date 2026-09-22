import sys
import re

file_path = 'src/components/UploadForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Add Calendar to imports
if 'Calendar' not in code:
    code = code.replace('import { Loader2', 'import { Calendar, Loader2')

# Replace the Step 1 form
old_form_pattern = re.compile(r'\{\/\* STEP 1: Release Info \*\/\}.*?\{\/\* STEP 2: Tracklist Form \*\/\}', re.DOTALL)

new_form = """{/* STEP 1: Release Info */}
      <form id="release-info-form" onSubmit={handleNextToTracklist} className={step === 1 ? "block animate-fade-in space-y-6" : "hidden"}>
        
        {/* Card 1: Informasi Rilisan */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-green-100 p-3 rounded-xl text-green-600">
              <Music size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Informasi Rilisan</h3>
              <p className="text-sm text-gray-500">Pastikan semua data sudah benar sebelum melanjutkan.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipe Rilisan *</label>
              <select 
                name="type" 
                value={releaseType}
                onChange={(e) => setReleaseType(e.target.value as any)}
                required 
                className="fundflow-input w-full"
              >
                <option value="SINGLE">Single (1 Lagu)</option>
                <option value="EP">EP (2-6 Lagu)</option>
                <option value="ALBUM">Album (7+ Lagu)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Judul {releaseType === "SINGLE" ? "Lagu" : "Rilisan"} *</label>
              <input type="text" name="title" defaultValue={defaultTitle} required className="fundflow-input w-full" placeholder={`Masukkan Judul ${releaseType === "SINGLE" ? "Lagu" : "Album/EP"}`} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Artis Utama *</label>
              <div className="flex gap-2">
                <select name="primaryArtistId" required className="fundflow-input flex-1">
                  <option value="">-- Pilih Artis --</option>
                  {artists.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.stageName}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowNewArtistModal(true)} className="px-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors" title="Tambah Artis Baru">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Genre Utama *</label>
              <select name="genre" required className="fundflow-input w-full">
                <option value="">-- Pilih Genre --</option>
                <option value="Pop">Pop</option>
                <option value="Dangdut">Dangdut</option>
                <option value="Koplo">Koplo</option>
                <option value="Rock">Rock</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="R&B">R&B</option>
                <option value="Electronic">Electronic</option>
                <option value="Jazz">Jazz</option>
                <option value="Classical">Classical</option>
                <option value="Folk">Folk</option>
                <option value="Reggae">Reggae</option>
                <option value="World">World</option>
                <option value="Acoustic">Acoustic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Bahasa Lirik *</label>
              <select name="language" required className="fundflow-input w-full">
                <option value="">-- Pilih Bahasa --</option>
                <option value="Indonesian">Indonesia</option>
                <option value="Javanese">Jawa</option>
                <option value="Sundanese">Sunda</option>
                <option value="English">Inggris</option>
                <option value="Instrumental">Instrumental (Tanpa Lirik)</option>
                <option value="Other">Lainnya</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Jadwal Rilis & Cover */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-green-100 p-3 rounded-xl text-green-600">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Jadwal Rilis & Cover</h3>
              <p className="text-sm text-gray-500">Tentukan tanggal dan gambar sampul musik kamu.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Rilis *</label>
              <input type="date" name="releaseDate" required className="fundflow-input w-full" />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">Cover Artwork *</label>
              <div className="relative group">
                <input 
                  type="file" 
                  name="coverArtwork" 
                  accept="image/jpeg, image/png, image/webp" 
                  required 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => setCoverFileName(e.target.files?.[0]?.name || "")}
                />
                <div className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${coverFileName ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 group-hover:border-green-300 group-hover:bg-green-50/50'}`}>
                  {coverFileName ? (
                    <>
                      <CheckCircle2 className="text-green-500 mb-2" size={28} />
                      <span className="text-green-600 font-medium truncate max-w-full px-4">{coverFileName}</span>
                      <span className="text-xs text-green-600/70 mt-1">Klik untuk mengganti</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="text-gray-400 mb-2 group-hover:text-green-500 transition-colors" size={28} />
                      <span className="text-gray-600 font-medium">Upload Cover Artwork</span>
                      <span className="text-xs text-gray-400 mt-1">Format: JPG, PNG (Min. 3000x3000px, Max 10MB)</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Button */}
        <div>
          <button type="submit" className="w-full bg-[#166534] hover:bg-[#14532d] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-900/20">
            Simpan & Lanjutkan <ArrowRight size={20} />
          </button>
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 justify-center">
            <CheckCircle2 size={16} className="text-gray-400" />
            <p>Disarankan minimal 7 hari dari sekarang agar masuk playlist.</p>
          </div>
        </div>
      </form>

      {/* STEP 2: Tracklist Form */}"""

if old_form_pattern.search(code):
    code = old_form_pattern.sub(new_form, code)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched Step 1 UI!")
else:
    print("Step 1 UI block not found.")
