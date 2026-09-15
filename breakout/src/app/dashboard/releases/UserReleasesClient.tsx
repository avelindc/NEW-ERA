"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, Eye, Play, Pause, CheckCircle2, Tag, 
  Compass, Radio, User, ChevronRight, ChevronLeft, Clock, Download, Trash2,
  Search, Filter, Disc, Loader2, Volume2, VolumeX, AlertCircle, Sparkles
} from "lucide-react";
import { bulkDeleteReleasesAction } from "@/app/actions/admin";

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
  releaseDate: Date | string;
  coverArtworkUrl: string;
  status: string;
  tracks: Track[];
}

export function UserReleasesClient({ releases }: { releases: Release[] }) {
  const [list, setList] = useState<Release[]>(releases);
  const [selected, setSelected] = useState<Release | null>(null);
  
  // Search & Status Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Pagination (20 items per page for instant loading)
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  // Audio Player State
  const [currentTrack, setCurrentTrack] = useState<{ track: Track; release: Release } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
      showToast("Gagal memutar audio. Pastikan file valid atau coba unduh langsung.");
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
      showToast("URL Audio tidak ditemukan.");
      return;
    }

    if (currentTrack?.track.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play().catch(() => {
          showToast("Izin pemutaran audio diblokir browser. Klik tombol play lagi.");
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
          showToast("Gagal memutar audio secara otomatis. Klik Play di player bawah.");
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

  // 100% Reliable Download Handler
  const handleDownload = async (url: string, filename: string, id?: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!url) {
      showToast("URL file tidak ditemukan.");
      return;
    }

    if (id) setDownloadingId(id);
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
      throw new Error(`Proxy error status ${res.status}`);
    } catch (err) {
      console.warn("Proxy download fallback to direct anchor:", err);
      // Seamless direct fallback
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Mengunduh langsung dari server CDN...`);
    } finally {
      if (id) setDownloadingId(null);
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

  const handleDeleteRelease = async (rel: Release, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm(`Apakah Anda yakin ingin membatalkan dan menghapus rilis "${rel.title}"?`)) return;
    setIsDeleting(true);
    const res = await bulkDeleteReleasesAction([rel.id]);
    setIsDeleting(false);
    if (res.error) {
      alert(res.error);
    } else {
      setList(prev => prev.filter(item => item.id !== rel.id));
      if (selected?.id === rel.id) setSelected(null);
      if (currentTrack?.release.id === rel.id) {
        audioRef.current?.pause();
        setCurrentTrack(null);
        setIsPlaying(false);
      }
      showToast("Rilisan berhasil dihapus.");
    }
  };

  const filteredList = list.filter(rel => {
    const matchesSearch = 
      rel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rel.primaryArtist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rel.featuredArtist && rel.featuredArtist.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rel.tracks?.[0]?.isrc && rel.tracks[0].isrc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rel.tracks?.[0]?.upc && rel.tracks[0].upc.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === "ALL" || rel.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const total = filteredList.length;
  const totalPages = Math.ceil(total / LIMIT) || 1;
  const safePage = Math.min(page, totalPages);
  const startItem = total > 0 ? (safePage - 1) * LIMIT + 1 : 0;
  const endItem = Math.min(safePage * LIMIT, total);
  const paginatedList = filteredList.slice((safePage - 1) * LIMIT, safePage * LIMIT);

  const getStatusBadge = (status: string) => {
    if (status === 'RELEASED' || status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-sm whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> APPROVED
        </span>
      );
    }
    if (status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full shadow-sm whitespace-nowrap">
          <Clock className="w-3 h-3 text-yellow-600" /> PENDING
        </span>
      );
    }
    if (status === 'REVIEW' || status === 'PROCESSING') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full shadow-sm whitespace-nowrap">
          <Clock className="w-3 h-3 text-blue-600" /> REVIEW
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full shadow-sm whitespace-nowrap">
        <X className="w-3 h-3 text-red-600" /> REJECTED
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Hidden Native Audio Element */}
      <audio ref={audioRef} crossOrigin="anonymous" preload="metadata" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[999999] bg-gray-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 text-xs font-semibold flex items-center gap-2.5 backdrop-blur-xl animate-fade-in">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-purple-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari lagu, genre, artis, ISRC, UPC..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-11 pr-10 py-3.5 w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-2xl outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(""); setPage(1); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 hidden sm:inline" />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="text-xs font-bold bg-white border border-gray-200 text-gray-700 py-3.5 px-4 rounded-2xl outline-none focus:border-purple-500 cursor-pointer shadow-sm w-full md:w-auto"
          >
            <option value="ALL">Semua Status</option>
            <option value="APPROVED">Approved / Released</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Info Status Bar */}
      <div className="flex justify-between items-center text-xs text-gray-500 font-medium px-2">
        <div>
          {total > 0 ? (
            <span>Menampilkan <strong className="text-gray-800">{startItem}-{endItem}</strong> dari <strong className="text-gray-800">{total.toLocaleString("id-ID")}</strong> rilisan</span>
          ) : (
            "Tidak ada data rilisan"
          )}
        </div>
      </div>

      {/* Premium Table View */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-3 md:p-6 transform-gpu">
        <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-gray-50/70 text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-100">
                <th className="p-3.5 md:p-4 font-bold pl-4 md:pl-6 w-16 text-center">COVER</th>
                <th className="p-3.5 md:p-4 font-bold">JUDUL RILISAN & TRACK</th>
                <th className="p-3.5 md:p-4 font-bold">ARTIS</th>
                <th className="p-3.5 md:p-4 font-bold">GENRE / BAHASA</th>
                <th className="p-3.5 md:p-4 font-bold">TANGGAL RILIS</th>
                <th className="p-3.5 md:p-4 font-bold">STATUS</th>
                <th className="p-3.5 md:p-4 font-bold text-center pr-4 md:pr-6">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Disc className="w-12 h-12 text-gray-200 mb-3 animate-pulse" />
                      <p className="font-bold text-gray-900 text-base">Tidak ada rilisan ditemukan</p>
                      <p className="text-sm text-gray-400 mt-1">Coba ubah kata kunci pencarian atau filter status.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((rel) => {
                  const firstTrack = rel.tracks?.[0];
                  const isThisTrackActive = firstTrack && currentTrack?.track.id === firstTrack.id;
                  const isThisPlaying = isThisTrackActive && isPlaying;
                  const isThisBuffering = isThisTrackActive && isBuffering;

                  return (
                    <tr 
                      key={rel.id} 
                      onClick={() => setSelected(rel)}
                      className={`hover:bg-purple-50/40 transition cursor-pointer group ${
                        isThisTrackActive ? "bg-purple-50/60" : ""
                      }`}
                    >
                      {/* Cover Thumbnail with Mini Play Button */}
                      <td className="p-3.5 md:p-4 pl-4 md:pl-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 mx-auto group/thumb shadow-sm">
                          <img 
                            src={rel.coverArtworkUrl} 
                            alt={rel.title}
                            loading="lazy"
                            onError={handleImageError}
                            className="w-full h-full object-cover"
                          />
                          {firstTrack && (
                            <button
                              onClick={(e) => playAudio(firstTrack, rel, e)}
                              className={`absolute inset-0 bg-black/50 flex items-center justify-center text-white transition ${
                                isThisTrackActive ? "opacity-100" : "opacity-0 group-hover/thumb:opacity-100"
                              }`}
                              title={isThisPlaying ? "Pause Audio" : "Play Audio"}
                            >
                              {isThisBuffering ? (
                                <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                              ) : isThisPlaying ? (
                                <Pause className="w-4 h-4 fill-current text-purple-400" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Title & Track Details */}
                      <td className="p-3.5 md:p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm group-hover:text-purple-600 transition truncate max-w-xs flex items-center gap-1.5">
                            {rel.title}
                            {isThisPlaying && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                            {firstTrack?.isrc ? (
                              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600">{firstTrack.isrc}</span>
                            ) : null}
                            {firstTrack?.upc ? (
                              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600">UPC: {firstTrack.upc}</span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Primary Artist & Feat */}
                      <td className="p-3.5 md:p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 text-sm">{rel.primaryArtist}</span>
                          {rel.featuredArtist && (
                            <span className="text-xs text-gray-400">feat. {rel.featuredArtist}</span>
                          )}
                        </div>
                      </td>

                      {/* Genre & Language */}
                      <td className="p-3.5 md:p-4 text-xs font-medium text-gray-600">
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                          <Compass className="w-3 h-3 text-purple-500" />
                          {rel.genre}
                        </span>
                      </td>

                      {/* Release Date */}
                      <td className="p-3.5 md:p-4 text-xs font-medium text-gray-500 whitespace-nowrap">
                        {(() => {
                          const d = new Date(rel.releaseDate);
                          return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
                        })()}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5 md:p-4">
                        {getStatusBadge(rel.status)}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 md:p-4 pr-4 md:pr-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Play Button */}
                          {firstTrack && (
                            <button
                              onClick={(e) => playAudio(firstTrack, rel, e)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm ${
                                isThisPlaying 
                                  ? "bg-purple-600 text-white shadow-purple-500/25 shadow-md" 
                                  : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                              }`}
                              title={isThisPlaying ? "Pause" : "Play"}
                            >
                              {isThisBuffering ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isThisPlaying ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              )}
                            </button>
                          )}

                          {/* Download Button */}
                          {firstTrack && (
                            <button
                              onClick={(e) => handleDownload(firstTrack.audioUrl, `${rel.title} - ${firstTrack.title}.mp3`, firstTrack.id, e)}
                              disabled={downloadingId === firstTrack.id}
                              className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition shadow-sm disabled:opacity-50"
                              title="Download Audio"
                            >
                              {downloadingId === firstTrack.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Detail Button */}
                          <button
                            onClick={() => setSelected(rel)}
                            className="w-8 h-8 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center transition shadow-sm"
                            title="Lihat Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button (for PENDING / REJECTED) */}
                          {rel.status !== 'APPROVED' && (
                            <button
                              onClick={(e) => handleDeleteRelease(rel, e)}
                              disabled={isDeleting}
                              className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition shadow-sm"
                              title="Hapus Rilisan Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 text-xs">
            <span className="text-gray-500 font-medium">
              Halaman <strong>{safePage}</strong> dari <strong>{totalPages}</strong> ({total} total rilisan)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pNum = i + 1;
                if (totalPages > 5) {
                  if (safePage > 3) {
                    pNum = safePage - 2 + i;
                    if (pNum > totalPages) pNum = totalPages - (4 - i);
                  }
                }
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-8 h-8 rounded-xl font-bold transition ${
                      safePage === pNum
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                        : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Global Audio Player Bar */}
      {currentTrack && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[480px] z-[99998] bg-gray-900/95 text-white backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-3.5 animate-slide-up flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gray-800 shrink-0 border border-white/10">
              <img 
                src={currentTrack.release.coverArtworkUrl} 
                alt="Artwork" 
                onError={handleImageError}
                className="w-full h-full object-cover" 
              />
            </div>

            {/* Title & Artist */}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs text-white truncate">{currentTrack.track.title}</p>
              <p className="text-[11px] text-gray-400 truncate">{currentTrack.release.primaryArtist}</p>
            </div>

            {/* Play/Pause Button */}
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

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full text-gray-400 hover:text-white flex items-center justify-center transition shrink-0"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Download Button */}
            <button
              onClick={(e) => handleDownload(currentTrack.track.audioUrl, `${currentTrack.release.title} - ${currentTrack.track.title}.mp3`, currentTrack.track.id, e)}
              className="w-8 h-8 rounded-full text-gray-400 hover:text-emerald-400 flex items-center justify-center transition shrink-0"
              title="Download Audio File"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Close Player */}
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

          {/* Seekbar and Timings */}
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

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 pb-4 bg-gradient-to-br from-[#7c3aed] to-[#6366f1] rounded-t-3xl text-white">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex gap-5 items-center">
                <div className="relative w-20 h-20 rounded-2xl bg-white/10 overflow-hidden shadow-lg border border-white/15 shrink-0 group/cov">
                  <img 
                    src={selected.coverArtworkUrl} 
                    alt="Cover" 
                    onError={handleImageError}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cov:opacity-100 transition flex items-center justify-center">
                    <button
                      onClick={(e) => handleDownload(selected.coverArtworkUrl, `${selected.title} - Cover.jpg`, "cover-modal", e)}
                      className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white transition"
                      title="Download Cover Artwork"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold tracking-widest bg-white/20 text-white px-2.5 py-0.5 rounded-full uppercase border border-white/10">
                    Release Detail
                  </span>
                  <h2 className="text-xl font-bold mt-1.5 truncate">{selected.title}</h2>
                  <p className="text-white/80 text-sm truncate">by {selected.primaryArtist}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-3.5">
                <SpecItem label="Genre" value={selected.genre} icon={<Compass className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="Bahasa" value={selected.language} icon={<Radio className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="TikTok Clip Start" value={selected.tracks?.[0]?.tiktokClipStart ? `Detik ${selected.tracks?.[0]?.tiktokClipStart}` : "-"} icon={<Clock className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="Artis Terdaftar" value={selected.primaryArtist} icon={<User className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="ISRC" value={selected.tracks?.[0]?.isrc || "-"} icon={<Tag className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="UPC" value={selected.tracks?.[0]?.upc || "-"} icon={<Tag className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="Composer" value={selected.tracks?.[0]?.composer || "-"} icon={<User className="w-4 h-4 text-purple-600" />} />
                <SpecItem label="Producer" value={selected.tracks?.[0]?.producer || "-"} icon={<User className="w-4 h-4 text-purple-600" />} />
              </div>

              {/* Audio Play preview inside modal */}
              {selected.tracks && selected.tracks.length > 0 && selected.tracks[0] && (
                <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={(e) => playAudio(selected.tracks[0]!, selected, e)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        currentTrack?.track.id === selected.tracks[0].id && isPlaying
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25" 
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      {currentTrack?.track.id === selected.tracks[0].id && isBuffering ? (
                        <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                      ) : currentTrack?.track.id === selected.tracks[0].id && isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{selected.tracks[0].title}</p>
                      <p className="text-xs text-gray-400">Audio Preview Player</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDownload(selected.tracks[0]!.audioUrl, `${selected.title} - ${selected.tracks[0]!.title}.mp3`, selected.tracks[0]!.id, e)}
                    disabled={downloadingId === selected.tracks[0]!.id}
                    className="h-10 px-4 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs flex items-center gap-1.5 shadow-sm transition shrink-0 disabled:opacity-50"
                  >
                    {downloadingId === selected.tracks[0]!.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Download</span>
                  </button>
                </div>
              )}

              {/* Action buttons for pending/rejected */}
              {selected.status !== 'APPROVED' && (
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={(e) => handleDeleteRelease(selected, e)}
                    disabled={isDeleting}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Rilisan Ini
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SpecItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
      <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}
