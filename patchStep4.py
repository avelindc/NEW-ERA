import sys
import re

file_path = 'src/components/UploadForm.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

step4_pattern = re.compile(r'\{\/\* STEP 4: Uploading Progress \*\/\}\s*\{step === 4 && \(\s*<div className="fundflow-card p-12 text-center max-w-xl mx-auto flex flex-col items-center justify-center \s*space-y-6 animate-scale-in">.*?<\/div>\s*\)\}', re.DOTALL)

new_step4 = r"""{/* STEP 4: Uploading Progress */}
        {step === 4 && (
          <div className="max-w-3xl mx-auto animate-scale-in p-4 md:p-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
              <div className="p-6 md:p-8 flex items-center gap-5 border-b border-gray-100">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Music size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Mengunggah File</h3>
                  <p className="text-gray-500 font-medium">
                    {(() => {
                      const match = uploadStatusText.match(/Lagu (\d+)/);
                      const currentTrack = match ? parseInt(match[1]) : (uploadStatusText.includes("Menyimpan rilis") ? tracks.length : 0);
                      return `${currentTrack} dari ${tracks.length} lagu`;
                    })()}
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-gray-50/50 space-y-4">
                {tracks.map((track: any, i: number) => {
                  let status = "Waiting";
                  let progress = 0;
                  let text = "Menunggu giliran...";
                  
                  const currentTrackMatch = uploadStatusText.match(/Lagu (\d+)/);
                  const currentTrackNum = currentTrackMatch ? parseInt(currentTrackMatch[1]) : 0;
                  
                  if (uploadStatusText.includes("Menyimpan rilis") || uploadStatusText.includes("berhasil dikirim")) {
                    status = "Selesai"; progress = 100; text = "Selesai diunggah";
                  } else if (currentTrackNum === i + 1) {
                    status = "Uploading";
                    const progressMatch = uploadStatusText.match(/\((\d+)%/);
                    progress = progressMatch ? parseInt(progressMatch[1]) : (uploadStatusText.includes("Mempersiapkan") ? 5 : 15);
                    text = uploadStatusText.replace(/^\[Lagu \d+\/\d+\]\s*/, '');
                  } else if (currentTrackNum > i + 1 || (currentTrackNum === 0 && !uploadStatusText.includes("Cover"))) {
                    status = "Selesai"; progress = 100; text = "Selesai diunggah";
                  } else if (uploadStatusText.includes("Cover")) {
                    status = "Waiting"; progress = 0; text = "Menunggu giliran...";
                  }

                  const sizeMB = track.audioFile ? (track.audioFile.size / (1024 * 1024)).toFixed(1) : "0";
                  const isMp3 = track.audioFile?.type?.includes("mpeg") || track.audioFile?.name?.endsWith(".mp3");
                  
                  return (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                        <Music size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900 truncate">{track.title || `Lagu ${i + 1}`}</h4>
                            <p className="text-xs text-gray-500 font-medium">{isMp3 ? 'MP3' : 'WAV'} • {sizeMB} MB</p>
                          </div>
                          <span className="text-sm font-bold text-gray-700">{progress}%</span>
                        </div>
                        
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                          {status === "Uploading" ? <Loader2 size={14} className="animate-spin text-blue-500" /> : 
                           status === "Selesai" ? <CheckCircle2 size={14} className="text-green-500" /> :
                           <Clock size={14} />}
                          <span className={status === "Uploading" ? "text-blue-600" : ""}>{text}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-5 bg-blue-50/80 border-t border-blue-100 flex gap-4 text-blue-800">
                <Info className="shrink-0 text-blue-600" size={24} />
                <div className="text-sm leading-relaxed font-medium">
                  <p>Proses upload berjalan di latar belakang.</p>
                  <p>File kamu akan tetap aman dan tidak akan hilang.</p>
                </div>
              </div>
            </div>

            {/* Cover Upload Progress Below Card */}
            <div className="max-w-2xl mx-auto px-4">
              {(() => {
                let coverProgress = 0;
                let coverText = "Menunggu...";
                if (uploadStatusText.includes("Cover")) {
                  const progressMatch = uploadStatusText.match(/\((\d+)%/);
                  coverProgress = progressMatch ? parseInt(progressMatch[1]) : 15;
                  coverText = uploadStatusText;
                } else if (uploadStatusText.includes("Lagu") || uploadStatusText.includes("Menyimpan rilis") || uploadStatusText.includes("berhasil dikirim")) {
                  coverProgress = 100;
                  coverText = "Cover Artwork selesai diunggah.";
                }
                
                return (
                  <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-gray-500">{coverText}</span>
                      <span className="text-sm font-bold text-gray-700">{coverProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${coverProgress}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
              
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                Harap jangan menutup halaman ini sampai proses selesai. File audio yang besar mungkin memerlukan waktu beberapa menit.
              </p>
            </div>
          </div>
        )}"""

match = step4_pattern.search(code)
if match:
    code = code[:match.start()] + new_step4 + code[match.end():]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Step 4 UI patched!")
else:
    print("Step 4 UI block not found. Checking if it already looks different.")
