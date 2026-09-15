"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, Eye, Play, Pause, Check, Download, Clock, 
  Tag, Compass, Radio, User, FileText, ChevronRight, Music, AlertCircle, Loader2,
  Volume2, VolumeX, Sparkles
} from "lucide-react";
import { updateReleaseStatusAction } from "@/app/actions/admin";

interface Track {
  id: string;
  title: string;
  audioUrl: string;
  composer: string | null;
  producer: string | null;
  lyrics: string | null;
  isrc: string | null;
  upc: string | null;
  tiktokClipStart: string | null;
}

interface Release {
  id: string;
  title: string;
  genre: string;
  language: string;
  primaryArtist: string;
  featuredArtist: string | null;
  releaseDate: string;
  coverArtworkUrl: string;
  status: string;
  artistUserId: string;
  artistName: string;
  artistEmail: string;
  tracks: Track[];
}

export function ReviewList({ releases }: { releases: Release[] }) {
  const [list, setList] = useState<Release[]>(releases);
  const [selected, setSelected] = useState<Release | null>(null);
  
  // Audio Player State
  const [currentTrack, setCurrentTrack] = useState<{ track: Track; release: Release } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Action states
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Audio Event Management
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsBuffering(false);
    };
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = (e: any) => {
      console.warn("Audio error, trying alternate domain fallback:", e);
      if (audio.src.includes("breakoutmusicrecord.com")) {
        audio.src = audio.src.replace("breakoutmusicrecord.com", "breakoutmusic.online");
        audio.load();
        audio.play().catch(() => {
          setIsBuffering(false);
          setIsPlaying(false);
          showToast("Gagal memutar audio. Pastikan file valid.");
        });
        return;
      } else if (audio.src.includes("breakoutmusic.online")) {
        audio.src = audio.src.replace("breakoutmusic.online", "breakoutmusicrecord.com");
        audio.load();
        audio.play().catch(() => {
          setIsBuffering(false);
          setIsPlaying(false);
          showToast("Gagal memutar audio. Pastikan file valid.");
        });
        return;
      }
      setIsBuffering(false);
      setIsPlaying(false);
      showToast("Gagal memutar audio. Format tidak didukung atau URL tidak dapat diakses.");
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  const playAudio = (track: Track, release: Release, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!track.audioUrl) {
      showToast("URL Audio tidak valid.");
      return;
    }

    if (currentTrack?.track.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play().catch(() => {
          showToast("Izin pemutaran audio dicegah browser. Silakan klik tombol play lagi.");
        });
      }
    } else {
      setCurrentTrack({ track, release });
      setIsBuffering(true);
      setCurrentTime(0);
      setDuration(0);

      if (audioRef.current) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch((err) => {
          console.error("Play error:", err);
          setIsBuffering(false);
          showToast("Gagal memutar otomatis. Silakan klik Play pada player di bawah.");
        });
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const handleDownload = async (url: string, filename: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!url) {
      showToast("URL file tidak ditemukan.");
      return;
    }

    setDownloadingId(id);
    showToast(`Memulai unduhan: ${filename}...`);

    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        showToast(`Unduhan selesai: ${filename}`);
        return;
      }
      throw new Error(`Proxy status: ${res.status}`);
    } catch (err) {
      console.warn("Download proxy fallback:", err);
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("Mengunduh langsung dari server CDN...");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    const step = parseInt(target.dataset.fallbackStep || "0", 10);
    target.dataset.fallbackStep = (step + 1).toString();

    if (step === 0) {
      if (target.src.includes("breakoutmusicrecord.com")) {
        target.src = target.src.replace("breakoutmusicrecord.com", "breakoutmusic.online");
        return;
      } else if (target.src.includes("breakoutmusic.online")) {
        target.src = target.src.replace("breakoutmusic.online", "breakoutmusicrecord.com");
        return;
      }
    } else if (step === 1) {
      if (target.src.includes("assets.")) {
        target.src = target.src.replace("assets.", "releases.");
        return;
      } else if (target.src.includes("releases.")) {
        target.src = target.src.replace("releases.", "assets.");
        return;
      }
    }

    target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e1b4b'/><circle cx='50' cy='50' r='30' fill='%23312e81'/><circle cx='50' cy='50' r='10' fill='%234338ca'/><path d='M47 40 L47 55 L58 47 Z' fill='%23a5b4fc'/></svg>";
  };

  const handleApprove = async (rel: Release) => {
    setLoadingApprove(true);
    await updateReleaseStatusAction(rel.id, rel.artistUserId, "APPROVED", rel.artistName, rel.artistEmail, rel.title, "");
    setList(prev => prev.filter(item => item.id !== rel.id));
    setLoadingApprove(false);
    setSelected(null);
    if (currentTrack?.release.id === rel.id) {
      audioRef.current?.pause();
      setCurrentTrack(null);
      setIsPlaying(false);
    }
    showToast(`Rilisan "${rel.title}" berhasil disetujui!`);
  };

  const handleReject = async (rel: Release) => {
    if (!reason.trim()) {
      alert("Alasan penolakan harus diisi!");
      return;
    }
    setLoadingReject(true);
    await updateReleaseStatusAction(rel.id, rel.artistUserId, "REJECTED", rel.artistName, rel.artistEmail, rel.title, reason);
    setList(prev => prev.filter(item => item.id !== rel.id));
    setLoadingReject(false);
    setRejectMode(false);
    setReason("");
    setSelected(null);
    if (currentTrack?.release.id === rel.id) {
      audioRef.current?.pause();
      setCurrentTrack(null);
      setIsPlaying(false);
    }
    showToast(`Rilisan "${rel.title}" ditolak.`);
  };

  return (
    <>
      {/* Hidden Native Audio Element */}
      <audio ref={audioRef} crossOrigin="anonymous" preload="metadata" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[999999] bg-gray-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 text-xs font-semibold flex items-center gap-2.5 backdrop-blur-xl animate-fade-in">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Pending Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-28">
        {list.map(rel => {
          const firstTrack = rel.tracks?.[0];
          const isThisTrackActive = firstTrack && currentTrack?.track.id === firstTrack.id;
          const isThisPlaying = isThisTrackActive && isPlaying;

          return (
            <div
              key={rel.id}
              onClick={() => { setSelected(rel); setRejectMode(false); setReason(""); }}
              className={`cursor-pointer group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                isThisTrackActive ? "ring-2 ring-purple-500" : ""
              }`}
            >
              {/* Cover Aspect Box */}
              <div className="aspect-square bg-gray-900 w-full relative overflow-hidden shrink-0">
                <img
                  src={rel.coverArtworkUrl}
                  alt={rel.title}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-3">
                  {firstTrack && (
                    <button
                      onClick={(e) => playAudio(firstTrack, rel, e)}
                      className="w-12 h-12 bg-purple-600/90 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold shadow-lg hover:scale-110 transition"
                      title={isThisPlaying ? "Pause" : "Play"}
                    >
                      {isThisPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                  )}
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
                <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 bg-yellow-400 text-yellow-950 rounded-full shadow">
                  PENDING REVIEW
                </span>
              </div>

              {/* Info body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 truncate text-base mb-1 group-hover:text-purple-600 transition flex items-center gap-1.5">
                    {rel.title}
                    {isThisPlaying && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                  </h4>
                  <p className="text-xs font-semibold text-gray-500 truncate mb-2">
                    {rel.primaryArtist} {rel.featuredArtist && `(feat. ${rel.featuredArtist})`}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{rel.genre}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {(() => {
                      const d = new Date(rel.releaseDate);
                      return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
                    })()}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Global Audio Player Bar */}
      {currentTrack && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[480px] z-[99998] bg-gray-900/95 text-white backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-3.5 animate-slide-up flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gray-800 shrink-0 border border-white/10">
              <img 
                src={currentTrack.release.coverArtworkUrl} 
                alt="Artwork" 
                onError={handleImageError}
                className="w-full h-full object-cover" 
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs text-white truncate">{currentTrack.track.title}</p>
              <p className="text-[11px] text-gray-400 truncate">{currentTrack.release.primaryArtist}</p>
            </div>

            <button
              onClick={() => {
                if (isPlaying) {
                  audioRef.current?.pause();
                } else {
                  audioRef.current?.play();
                }
              }}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center justify-center hover:scale-105 transition shadow-lg shrink-0"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isBuffering ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full text-gray-400 hover:text-white flex items-center justify-center transition shrink-0"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={(e) => handleDownload(currentTrack.track.audioUrl, `${currentTrack.release.title} - ${currentTrack.track.title}.mp3`, currentTrack.track.id, e)}
              className="w-8 h-8 rounded-full text-gray-400 hover:text-emerald-400 flex items-center justify-center transition shrink-0"
              title="Download Audio File"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                audioRef.current?.pause();
                setCurrentTrack(null);
                setIsPlaying(false);
              }}
              className="w-8 h-8 rounded-full text-gray-400 hover:text-white flex items-center justify-center transition shrink-0"
              title="Tutup Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] font-mono text-gray-400 w-8">{formatTime(currentTime)}</span>
            <input 
              type="range" 
              min={0} 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => { setSelected(null); setRejectMode(false); }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 pb-4 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-t-3xl text-white">
              <button
                onClick={() => { setSelected(null); setRejectMode(false); }}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex gap-5 items-center">
                <div className="relative w-20 h-20 rounded-2xl bg-white/10 overflow-hidden shadow-lg border border-white/15 group/cover shrink-0">
                  <img 
                    src={selected.coverArtworkUrl} 
                    alt="Cover" 
                    onError={handleImageError}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDownload(selected.coverArtworkUrl, `${selected.title} - Cover.jpg`, 'cover', e); }} 
                      disabled={downloadingId === 'cover'}
                      className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition text-white disabled:opacity-50"
                      title="Download Cover Artwork"
                    >
                      {downloadingId === 'cover' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold tracking-widest bg-yellow-400 text-yellow-950 px-2.5 py-0.5 rounded-full uppercase">
                    Review Queue
                  </span>
                  <h2 className="text-xl font-bold mt-1.5 truncate">{selected.title}</h2>
                  <p className="text-white/80 text-sm truncate">by {selected.primaryArtist}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Audio Track Player */}
              {selected.tracks.map((track) => (
                <div key={track.id} className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={(e) => playAudio(track, selected, e)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        currentTrack?.track.id === track.id && isPlaying
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25" 
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      {currentTrack?.track.id === track.id && isBuffering ? (
                        <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                      ) : currentTrack?.track.id === track.id && isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate text-sm">{track.title}</p>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
                        <Music className="w-3.5 h-3.5 text-purple-600" /> Master Audio File
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDownload(track.audioUrl, `${selected.title} - ${track.title}.mp3`, track.id, e)}
                    disabled={downloadingId === track.id}
                    className="h-10 px-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 shrink-0"
                  >
                    {downloadingId === track.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>Download</span>
                  </button>
                </div>
              ))}

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <SpecItem label="Genre" value={selected.genre} icon={<Compass className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="Bahasa" value={selected.language} icon={<Radio className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="TikTok Clip Start" value={selected.tracks?.[0]?.tiktokClipStart ? `Detik ${selected.tracks?.[0]?.tiktokClipStart}` : "-"} icon={<Clock className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="Artis Terdaftar" value={selected.artistName} icon={<User className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="ISRC" value={selected.tracks?.[0]?.isrc || "Auto-Generate"} icon={<Tag className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="UPC" value={selected.tracks?.[0]?.upc || "Auto-Generate"} icon={<Tag className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="Composer" value={selected.tracks?.[0]?.composer || "-"} icon={<User className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="Producer" value={selected.tracks?.[0]?.producer || "-"} icon={<User className="w-4 h-4 text-purple-600" />} />
              </div>

              {/* Lyrics Panel */}
              {selected.tracks?.[0]?.lyrics && (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-gray-400" /> Lirik Lagu
                  </h4>
                  <pre className="text-xs text-gray-700 leading-relaxed font-sans whitespace-pre-wrap max-h-32 overflow-y-auto bg-white p-3.5 rounded-xl border border-gray-100">
                    {selected.tracks?.[0]?.lyrics}
                  </pre>
                </div>
              )}

              {/* Reject Reason Form */}
              {rejectMode && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-3">
                  <h4 className="font-bold text-red-700 text-sm flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" /> Alasan Penolakan Musik
                  </h4>
                  <textarea
                    className="w-full text-sm p-3 border border-red-200 rounded-xl outline-none focus:border-red-500 transition bg-white text-gray-900"
                    rows={3}
                    placeholder="Contoh: Kualitas cover buram/blur, audio noise, dll..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setRejectMode(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleReject(selected)}
                      disabled={loadingReject}
                      className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 flex items-center gap-1.5 disabled:opacity-50 transition"
                    >
                      {loadingReject && <Loader2 className="w-3 h-3 animate-spin" />}
                      Tolak & Kirim
                    </button>
                  </div>
                </div>
              )}

              {/* Decision Action Buttons */}
              {!rejectMode && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleApprove(selected)}
                    disabled={loadingApprove || loadingReject}
                    className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 transition text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-green-500/25"
                  >
                    {loadingApprove ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Approve Release
                  </button>
                  <button
                    onClick={() => setRejectMode(true)}
                    disabled={loadingApprove || loadingReject}
                    className="flex-1 h-12 bg-gray-100 hover:bg-red-50 hover:text-red-600 transition text-gray-600 font-bold rounded-2xl flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject Release
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SpecItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
      <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}
