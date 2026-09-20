"use client";

import { useState } from "react";
import { 
  submitMusicMetadataAction, 
  saveUploadChunkAction, 
  assembleAndUploadToR2Action, 
  directUploadSmallFileAction 
} from "@/app/actions/upload";
import { createArtistAction } from "@/app/actions/artist";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, UploadCloud, CheckCircle2, Plus, ArrowRight, ArrowLeft, Check, Sparkles, Trash2, Music } from "lucide-react";

// Modern Streaming Platforms list (30 platforms)
const STREAMING_PLATFORMS = [
  { id: "spotify", name: "Spotify", logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" },
  { id: "apple_music", name: "Apple Music", logo: "https://upload.wikimedia.org/wikipedia/commons/d/df/Apple_Music_logo.svg" },
  { id: "youtube_music", name: "YouTube Music", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg" },
  { id: "tiktok", name: "TikTok", logo: "https://upload.wikimedia.org/wikipedia/commons/3/34/TikTok_logo.svg" },
  { id: "instagram", name: "Instagram Music", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" },
  { id: "facebook", name: "Facebook Stories", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" },
  { id: "amazon_music", name: "Amazon Music", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Amazon_Music_logo.svg" },
  { id: "deezer", name: "Deezer", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Deezer_logo_2023.svg" },
  { id: "tidal", name: "Tidal", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Tidal_logo.svg" },
  { id: "boomplay", name: "Boomplay", logo: "https://upload.wikimedia.org/wikipedia/en/9/90/Boomplay_Music_Logo.png" },
  { id: "audiomack", name: "Audiomack", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Audiomack_logo.png" },
  { id: "jiosaavn", name: "JioSaavn", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8c/JioSaavn_Logo.svg" },
  { id: "wynk", name: "Wynk Music", logo: "https://upload.wikimedia.org/wikipedia/en/1/1c/Wynk_Music_logo.png" },
  { id: "kkbox", name: "KKBOX", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9f/KKBOX_logo.svg" },
  { id: "anghami", name: "Anghami", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Anghami_logo.svg" },
  { id: "netease", name: "NetEase Cloud Music", logo: "https://upload.wikimedia.org/wikipedia/commons/d/df/NetEase_Music_logo.svg" },
  { id: "tencent", name: "Tencent Music (QQ)", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Tencent_Music_Entertainment_Group_Logo.svg" },
  { id: "resso", name: "Resso", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Resso_logo.svg" },
  { id: "pandora", name: "Pandora", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Pandora_logo.svg" },
  { id: "iheartradio", name: "iHeartRadio", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/IHeartRadio_logo.svg" },
  { id: "napster", name: "Napster", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Napster_logo.svg" },
  { id: "qobuz", name: "Qobuz", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Qobuz_logo.png" },
  { id: "shazam", name: "Shazam", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Shazam_logo.svg" },
  { id: "line_music", name: "LINE Music", logo: "https://upload.wikimedia.org/wikipedia/commons/5/52/LINE_Music_logo.svg" },
  { id: "yandex", name: "Yandex Music", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Yandex_Music_logo.svg" },
  { id: "soundcloud", name: "SoundCloud Go", logo: "https://upload.wikimedia.org/wikipedia/commons/8/84/SoundCloud_logo.svg" },
  { id: "claromusica", name: "Claro Música", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Claro_M%C3%BAsica_Logo.svg" },
  { id: "kuack", name: "Kuack Media", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Kuack_Media_Group_Logo.png" },
  { id: "joox", name: "JOOX", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/JOOX_logo.svg" },
  { id: "snapchat", name: "Snapchat Sounds", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Snapchat_logo.svg" },
];

export function UploadForm({ artists, userId }: { artists: any[]; userId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCover = searchParams.get("cover") === "true";
  const defaultTitle = searchParams.get("title") || "";
  const defaultArtist = searchParams.get("originalArtist") || "";

  const [step, setStep] = useState(1); // 1 = Release Info, 2 = Tracklist, 3 = Platforms, 4 = Progress
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("Memproses data...");

  const [releaseType, setReleaseType] = useState<"SINGLE" | "EP" | "ALBUM">("SINGLE");
  const [coverFileName, setCoverFileName] = useState("");

  const [showNewArtistModal, setShowNewArtistModal] = useState(false);
  const [newArtistName, setNewArtistName] = useState("");
  const [creatingArtist, setCreatingArtist] = useState(false);

  // Tracklist State
  const [tracks, setTracks] = useState<any[]>([{
    id: "track-1",
    audioFile: null,
    audioFileName: "",
    title: "",
    featuredArtist: "",
    composer: "",
    producer: "",
    lyrics: "",
    isrc: "",
    upc: "",
    tiktokClipStart: "00:30"
  }]);

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const addTrack = () => {
    setTracks([...tracks, {
      id: `track-${Date.now()}`,
      audioFile: null,
      audioFileName: "",
      title: "",
      featuredArtist: "",
      composer: "",
      producer: "",
      lyrics: "",
      isrc: "",
      upc: "",
      tiktokClipStart: "00:30"
    }]);
  };

  const removeTrack = (id: string) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter(t => t.id !== id));
    }
  };

  const updateTrack = (id: string, field: string, value: any) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAllPlatforms = () => {
    if (selectedPlatforms.length === STREAMING_PLATFORMS.length) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms(STREAMING_PLATFORMS.map(p => p.id));
    }
  };

  async function handleCreateArtist(e: React.FormEvent) {
    e.preventDefault();
    if (!newArtistName.trim()) return;
    
    setCreatingArtist(true);
    try {
      const res = await createArtistAction(newArtistName, userId);
      if (res?.error) {
        alert(res.error);
      } else {
        setShowNewArtistModal(false);
        setNewArtistName("");
        router.refresh();
      }
    } catch (err) {
      alert("Failed to create artist.");
    } finally {
      setCreatingArtist(false);
    }
  }

  // Smart uploader
  async function uploadFileSmart(
    file: File, 
    type: "cover" | "audio", 
    artistId: string, 
    onProgress?: (msg: string) => void
  ): Promise<string> {
    const label = type === "cover" ? "Cover Artwork" : "File Audio";

    if (file.size <= 3.5 * 1024 * 1024) {
      if (onProgress) onProgress(`Mengunggah ${label}...`);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      fd.append("artistId", artistId);
      
      const res = await directUploadSmallFileAction(fd);
      if (res.error || !res.publicUrl) {
        throw new Error(res.error || `Gagal mengunggah ${label}`);
      }
      return res.publicUrl;
    }

    const sizeMB = Math.round(file.size / (1024 * 1024));
    if (onProgress) onProgress(`Menyiapkan ${label} (${sizeMB}MB)...`);

    const uploadId = `upl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const CHUNK_SIZE = 2 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunkBlob = file.slice(start, end);
      const chunkFile = new File([chunkBlob], `${file.name}.part${i}`, { type: file.type });
      
      const progressPercent = Math.round(((i + 1) / totalChunks) * 100);
      if (onProgress) onProgress(`Mengunggah ${label} (${progressPercent}% - Bagian ${i + 1}/${totalChunks})...`);

      const chunkFd = new FormData();
      chunkFd.append("uploadId", uploadId);
      chunkFd.append("chunkIndex", i.toString());
      chunkFd.append("chunk", chunkFile);

      const partRes = await saveUploadChunkAction(chunkFd);
      if (partRes.error) {
        throw new Error(`Gagal mengunggah bagian ${i + 1}: ${partRes.error}`);
      }
    }

    if (onProgress) onProgress(`Menyimpan ${label} ke Cloudflare R2...`);
    const assembleRes = await assembleAndUploadToR2Action({
      uploadId,
      totalChunks,
      filename: file.name,
      contentType: file.type || (type === "audio" ? "audio/mpeg" : "image/jpeg"),
      type,
      artistId
    });

    if (assembleRes.error || !assembleRes.publicUrl) {
      throw new Error(assembleRes.error || `Gagal menyimpan ${label}`);
    }

    return assembleRes.publicUrl;
  }

  const handleNextToTracklist = (e: React.FormEvent) => {
    e.preventDefault();
    const form = document.getElementById("release-info-form") as HTMLFormElement;
    if (form && form.checkValidity()) {
      const coverInput = form.querySelector('input[name="coverArtwork"]') as HTMLInputElement;
      if (!coverInput?.files?.length) {
        setError("Silakan pilih file cover artwork terlebih dahulu.");
        return;
      }
      setError(null);
      setStep(2);
    } else {
      form.reportValidity();
    }
  };

  const handleNextToPlatforms = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate tracks
    for (let i=0; i < tracks.length; i++) {
      if (!tracks[i].audioFile) {
        setError(`Lagu ke-${i+1} belum memiliki file audio.`);
        return;
      }
      if (releaseType !== "SINGLE" && !tracks[i].title) {
         setError(`Lagu ke-${i+1} belum memiliki judul.`);
         return;
      }
    }
    setError(null);
    setStep(3);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedPlatforms.length === 0) {
      setError("Silakan pilih minimal satu platform streaming.");
      return;
    }

    const releaseForm = document.getElementById("release-info-form") as HTMLFormElement;
    if (!releaseForm) return;

    setLoading(true);
    setStep(4);
    
    try {
      const formData = new FormData(releaseForm);
      const title = formData.get("title") as string;
      const genre = formData.get("genre") as string;
      const language = formData.get("language") as string;
      const primaryArtistId = formData.get("primaryArtistId") as string;
      const releaseDateStr = formData.get("releaseDate") as string;
      const coverFile = formData.get("coverArtwork") as File;

      if (!primaryArtistId) throw new Error("Silakan pilih Artis Utama.");
      if (!coverFile) throw new Error("Cover artwork tidak ditemukan.");

      // Upload Cover
      const coverUrl = await uploadFileSmart(coverFile, "cover", primaryArtistId, setUploadStatusText);

      // Upload Tracks
      const uploadedTracks = [];
      for (let i = 0; i < tracks.length; i++) {
        const t = tracks[i];
        setUploadStatusText(`Mempersiapkan unggahan Lagu ${i+1} dari ${tracks.length}...`);
        const audioUrl = await uploadFileSmart(t.audioFile, "audio", primaryArtistId, (msg) => {
          setUploadStatusText(`[Lagu ${i+1}/${tracks.length}] ${msg}`);
        });
        
        uploadedTracks.push({
          title: t.title || title,
          audioUrl,
          featuredArtist: t.featuredArtist,
          composer: t.composer,
          producer: t.producer,
          lyrics: t.lyrics,
          isrc: t.isrc,
          upc: t.upc,
          tiktokClipStart: t.tiktokClipStart
        });
      }

      setUploadStatusText("Menyimpan rilis ke database...");
      
      const payload = {
        title,
        type: releaseType,
        genre,
        language,
        primaryArtistId,
        releaseDateStr,
        coverUrl,
        tracks: uploadedTracks
      };

      const res = await submitMusicMetadataAction(payload);
      
      if (res.error) {
        throw new Error(res.error);
      }

      setSuccess(true);
      setUploadStatusText("Rilis berhasil dikirim!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat mengunggah.");
      setStep(1); // Go back to fix errors
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="fundflow-card p-12 text-center max-w-2xl mx-auto flex flex-col items-center justify-center space-y-6 animate-scale-in">
        <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-white">Upload Sukses!</h2>
        <p className="text-gray-400 text-lg max-w-md">
          Musik kamu sudah masuk antrean kurasi. Kami akan mereview dan mengirimkannya ke platform streaming.
        </p>
        <button
          onClick={() => router.push("/dashboard/releases")}
          className="fundflow-btn-primary mt-8 w-full max-w-xs"
        >
          Lihat Rilisan Saya
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Progress Steps Header */}
      <div className="mb-8 flex items-center justify-between relative max-w-xl mx-auto">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 z-0 rounded-full"></div>
        <div className={`absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/3' : step === 3 ? 'w-2/3' : 'w-full'}`}></div>
        
        {[
          { num: 1, label: "Info Rilisan" },
          { num: 2, label: "Daftar Lagu" },
          { num: 3, label: "Platform" },
          { num: 4, label: "Upload" }
        ].map((s) => (
          <div key={s.num} className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
              step >= s.num ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "bg-white/10 text-gray-500"
            }`}>
              {step > s.num ? <Check size={18} /> : s.num}
            </div>
            <span className={`text-xs mt-2 font-medium ${step >= s.num ? "text-blue-400" : "text-gray-500"}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* STEP 1: Release Info */}
      <form id="release-info-form" onSubmit={handleNextToTracklist} className={step === 1 ? "block animate-fade-in" : "hidden"}>
        <div className="fundflow-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold flex items-center"><Sparkles className="mr-2 text-blue-400" size={20} /> Info Utama Rilisan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tipe Rilisan *</label>
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Judul {releaseType === "SINGLE" ? "Lagu" : "Rilisan"} *</label>
                <input type="text" name="title" defaultValue={defaultTitle} required className="fundflow-input w-full" placeholder={`Masukkan Judul ${releaseType === "SINGLE" ? "Lagu" : "Album/EP"}`} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Artis Utama *</label>
                <div className="flex gap-2">
                  <select name="primaryArtistId" required className="fundflow-input flex-1">
                    <option value="">-- Pilih Artis --</option>
                    {artists.map((a: any) => (
                      <option key={a.id} value={a.id}>{a.stageName}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowNewArtistModal(true)} className="fundflow-btn-secondary px-3 flex items-center justify-center" title="Tambah Artis Baru">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Genre Utama *</label>
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Bahasa Lirik *</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tanggal Rilis *</label>
                <input type="date" name="releaseDate" required className="fundflow-input w-full" />
                <p className="text-xs text-gray-500 mt-1">Disarankan minimal 7 hari dari sekarang agar masuk playlist.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <label className="block text-sm font-medium text-gray-400 mb-2">Cover Artwork *</label>
            <div className="relative group">
              <input 
                type="file" 
                name="coverArtwork" 
                accept="image/jpeg, image/png, image/webp" 
                required 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => setCoverFileName(e.target.files?.[0]?.name || "")}
              />
              <div className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${coverFileName ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 bg-white/5 group-hover:border-white/40 group-hover:bg-white/10'}`}>
                {coverFileName ? (
                  <>
                    <CheckCircle2 className="text-blue-500 mb-2" size={28} />
                    <span className="text-blue-400 font-medium truncate max-w-full px-4">{coverFileName}</span>
                    <span className="text-xs text-blue-500/70 mt-1">Klik untuk mengganti</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="text-gray-400 mb-2 group-hover:text-white transition-colors" size={28} />
                    <span className="text-gray-300 font-medium">Upload Cover Artwork</span>
                    <span className="text-xs text-gray-500 mt-1">Format: JPG, PNG (Min. 3000x3000px, Max 10MB)</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button type="submit" className="fundflow-btn-primary px-8 py-3 flex items-center gap-2">
              Lanjut ke Daftar Lagu <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </form>

      {/* STEP 2: Tracklist Form */}
      <div className={step === 2 ? "block animate-fade-in" : "hidden"}>
        <div className="space-y-6">
          {tracks.map((track, index) => (
            <div key={track.id} className="fundflow-card p-6 border border-white/10 relative">
              {releaseType !== "SINGLE" && (
                <div className="absolute top-4 right-4">
                  <button 
                    type="button" 
                    onClick={() => removeTrack(track.id)}
                    className="text-red-400 hover:text-red-300 p-2 bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold">Lagu {index + 1}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Audio Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">File Audio (WAV/MP3) *</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="audio/mpeg, audio/wav, audio/x-wav" 
                      required={!track.audioFile}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          updateTrack(track.id, 'audioFile', file);
                          updateTrack(track.id, 'audioFileName', file.name);
                        }
                      }}
                    />
                    <div className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${track.audioFileName ? 'border-green-500 bg-green-500/10' : 'border-white/20 bg-white/5 group-hover:border-white/40 group-hover:bg-white/10'}`}>
                      {track.audioFileName ? (
                        <>
                          <CheckCircle2 className="text-green-500 mb-1" size={24} />
                          <span className="text-green-400 font-medium truncate max-w-full px-4">{track.audioFileName}</span>
                        </>
                      ) : (
                        <>
                          <Music className="text-gray-400 mb-1 group-hover:text-white transition-colors" size={24} />
                          <span className="text-gray-300 font-medium">Upload File Audio</span>
                          <span className="text-xs text-gray-500 mt-1">Format: WAV atau MP3 Kualitas Tinggi</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {releaseType !== "SINGLE" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Judul Lagu *</label>
                    <input 
                      type="text" 
                      value={track.title}
                      onChange={(e) => updateTrack(track.id, 'title', e.target.value)}
                      required 
                      className="fundflow-input w-full" 
                      placeholder="Masukkan judul lagu ini" 
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Featured Artist (Opsional)</label>
                  <input 
                    type="text" 
                    value={track.featuredArtist}
                    onChange={(e) => updateTrack(track.id, 'featuredArtist', e.target.value)}
                    className="fundflow-input w-full" 
                    placeholder="Contoh: Justin Bieber, Selena Gomez" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Komposer / Pencipta Lagu</label>
                  <input 
                    type="text" 
                    value={track.composer}
                    onChange={(e) => updateTrack(track.id, 'composer', e.target.value)}
                    className="fundflow-input w-full" 
                    placeholder="Nama asli pencipta lagu" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Produser (Opsional)</label>
                  <input 
                    type="text" 
                    value={track.producer}
                    onChange={(e) => updateTrack(track.id, 'producer', e.target.value)}
                    className="fundflow-input w-full" 
                    placeholder="Nama produser musik" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">TikTok Clip Start Waktu</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={track.tiktokClipStart}
                      onChange={(e) => updateTrack(track.id, 'tiktokClipStart', e.target.value)}
                      className="fundflow-input w-24 text-center font-mono" 
                      placeholder="00:30"
                      pattern="[0-5][0-9]:[0-5][0-9]"
                    />
                    <span className="text-xs text-gray-500">Menit:Detik (Kapan lagu mulai di TikTok)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Kode ISRC (Opsional)</label>
                  <input 
                    type="text" 
                    value={track.isrc}
                    onChange={(e) => updateTrack(track.id, 'isrc', e.target.value)}
                    className="fundflow-input w-full font-mono text-sm" 
                    placeholder="Kosongkan untuk generate otomatis" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Kode UPC (Opsional)</label>
                  <input 
                    type="text" 
                    value={track.upc}
                    onChange={(e) => updateTrack(track.id, 'upc', e.target.value)}
                    className="fundflow-input w-full font-mono text-sm" 
                    placeholder="Kosongkan jika tidak ada" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Lirik (Opsional namun disarankan)</label>
                  <textarea 
                    value={track.lyrics}
                    onChange={(e) => updateTrack(track.id, 'lyrics', e.target.value)}
                    className="fundflow-input w-full min-h-[100px] resize-y" 
                    placeholder="Tempelkan lirik lagu di sini..."
                  ></textarea>
                </div>
              </div>
            </div>
          ))}

          {releaseType !== "SINGLE" && (
            <div className="flex justify-center mt-4">
              <button 
                type="button" 
                onClick={addTrack}
                className="fundflow-btn-secondary py-3 px-6 flex items-center gap-2 border border-dashed border-white/30"
              >
                <Plus size={18} /> Tambah Lagu Lainnya
              </button>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button type="button" onClick={() => setStep(1)} className="px-6 py-3 text-gray-400 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft size={18} /> Kembali
            </button>
            <button type="button" onClick={handleNextToPlatforms} className="fundflow-btn-primary px-8 py-3 flex items-center gap-2">
              Lanjut ke Platform <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* STEP 3: Platform Selection */}
      <form id="platforms-form" onSubmit={handleSubmit} className={step === 3 ? "block animate-fade-in" : "hidden"}>
        <div className="fundflow-card p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <h2 className="text-xl font-bold flex items-center"><Sparkles className="mr-2 text-blue-400" size={20} /> Pilih Platform Distribusi</h2>
            <button 
              type="button" 
              onClick={toggleAllPlatforms}
              className="text-sm px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            >
              {selectedPlatforms.length === STREAMING_PLATFORMS.length ? "Batalkan Semua" : "Pilih Semua"}
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {STREAMING_PLATFORMS.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <div 
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`relative p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-3 aspect-square
                    ${isSelected 
                      ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-0.5">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center p-2">
                    <img src={platform.logo} alt={platform.name} className="w-full h-full object-contain filter drop-shadow-sm" />
                  </div>
                  <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>{platform.name}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <button type="button" onClick={() => setStep(2)} className="px-6 py-3 text-gray-400 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft size={18} /> Kembali
            </button>
            <button type="submit" disabled={selectedPlatforms.length === 0} className="fundflow-btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              Submit Rilisan <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </form>

      {/* STEP 4: Uploading Progress */}
      {step === 4 && (
        <div className="fundflow-card p-12 text-center max-w-xl mx-auto flex flex-col items-center justify-center space-y-6 animate-scale-in">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <UploadCloud className="text-blue-500 animate-pulse" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Mengunggah File...</h2>
          <div className="w-full max-w-sm bg-black/40 rounded-lg p-4 border border-white/10 text-left">
            <div className="flex items-center gap-3">
              <Loader2 size={16} className="text-blue-400 animate-spin flex-shrink-0" />
              <p className="text-sm font-mono text-blue-300 break-words">{uploadStatusText}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-xs">Harap jangan menutup halaman ini sampai proses selesai. File audio yang besar mungkin memerlukan waktu beberapa menit.</p>
        </div>
      )}

      {/* NEW ARTIST MODAL */}
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
      )}
    </div>
  );
}
