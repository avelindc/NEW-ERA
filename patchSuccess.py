import sys
import re

file_path = 'src/components/UploadForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add Info, Clock to imports
if 'Info' not in code:
    code = code.replace('import { Calendar', 'import { Clock, Info, Calendar')

# 2. Add successData state
if 'const [successData, setSuccessData] = useState<any>(null);' not in code:
    code = code.replace('const [success, setSuccess] = useState(false);', 'const [success, setSuccess] = useState(false);\n  const [successData, setSuccessData] = useState<any>(null);')

# 3. Add successData setting in handleSubmit
handle_submit_success_pattern = r'setSuccess\(true\);\n\s*setUploadStatusText\("Rilis berhasil dikirim!"\);'
new_handle_submit_success = """setSuccessData({
        title,
        type: releaseType,
        genre,
        language,
        primaryArtistId,
        tracks: uploadedTracks
      });
      setSuccess(true);
      setUploadStatusText("Rilis berhasil dikirim!");"""
if 'setSuccessData({' not in code:
    code = re.sub(handle_submit_success_pattern, new_handle_submit_success, code)

# 4. Replace success UI
old_success_ui_pattern = re.compile(r'if \(success\) \{.*?return \(\s*<div className="fundflow-card p-12 text-center max-w-2xl mx-auto flex flex-col items-center justify-center space-y-6 animate-scale-in">.*?</button>\s*</div>\s*\);\s*\}', re.DOTALL)

new_success_ui = """if (success) {
    const primaryArtistName = artists.find(a => a.id === successData?.primaryArtistId)?.stageName || "Unknown Artist";
    
    return (
      <div className="max-w-3xl mx-auto animate-scale-in p-4 md:p-8">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#dcfce7] text-[#16a34a] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
            <CheckCircle2 size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Rilisan Berhasil Dikirim!</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            Terima kasih! Musik kamu sudah berhasil dikirim dan sekarang sedang masuk ke antrean kurasi. Kami akan meninjau dan mengirimkannya ke platform streaming secepatnya.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 gap-4">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0 text-gray-400">
                <Music size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{successData?.title || "Judul Rilisan"}</h3>
                <p className="text-gray-600 mb-2">oleh <span className="font-semibold text-gray-800">{primaryArtistName}</span></p>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <span>{successData?.tracks?.length || 1} lagu</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{successData?.genre || "Genre"}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{successData?.language || "Bahasa"}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-100 w-fit">
              <Clock size={16} />
              <span>Menunggu Review</span>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-gray-50/50">
            <h4 className="font-bold text-gray-900 mb-6 text-lg">Daftar Lagu</h4>
            <div className="space-y-4">
              {successData?.tracks?.map((track: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 text-gray-600 font-bold rounded-xl flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{track.title}</p>
                      <p className="text-sm text-gray-500">{primaryArtistName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                    <CheckCircle2 size={16} />
                    <span>File Diterima</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-blue-50/80 border border-blue-100 rounded-2xl p-5 flex gap-4 text-blue-800">
              <Info className="shrink-0 text-blue-600" size={24} />
              <div className="text-sm leading-relaxed">
                <p>Proses kurasi biasanya memakan waktu 1-3 hari kerja.</p>
                <p>Kamu akan mendapat notifikasi melalui email dan dashboard.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard/releases")}
            className="w-full bg-[#166534] hover:bg-[#14532d] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20 text-lg"
          >
            Lihat Rilisan Saya <ArrowRight size={20} />
          </button>
          
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 py-4 rounded-xl font-bold flex items-center justify-center transition-all text-lg"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }"""

if old_success_ui_pattern.search(code):
    code = old_success_ui_pattern.sub(new_success_ui, code)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Success UI patched!")
else:
    print("Success UI block not found.")
