"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { addRoyaltyAction } from "@/app/actions/royalties";

export function RoyaltyForm({ artists }: { artists: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [revenue, setRevenue] = useState<number | "">("");
  const [cut, setCut] = useState<number | "">(0);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const [monthYear, setMonthYear] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const selectedArtist = artists.find(a => a.id === selectedArtistId);
  const availableSongs = selectedArtist?.releases || [];

  const finalRevenue = typeof revenue === "number" && typeof cut === "number" ? revenue * (1 - cut / 100) : 0;
  
  const selectedMonth = monthYear ? parseInt(monthYear.split("-")[1]) : "";
  const selectedYear = monthYear ? parseInt(monthYear.split("-")[0]) : "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        const res = await addRoyaltyAction(formData);
        if (res && res.error) {
          setResult({ error: res.error });
        } else {
          setResult({ success: true });
          // Reset form fields
          setSelectedArtistId("");
          setRevenue("");
          setCut(0);
          form.reset();
        }
      } catch (err) {
        setResult({ error: "Terjadi kesalahan, coba lagi" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="month" value={selectedMonth} />
      <input type="hidden" name="year" value={selectedYear} />
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Artist *</label>
        <select 
          required 
          name="artistId" 
          value={selectedArtistId}
          onChange={(e) => setSelectedArtistId(e.target.value)}
          className="w-full bg-white/60 border border-white/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-gray-800 font-medium"
        >
          <option value="">Select Artist</option>
          {artists.map(artist => {
            const primaryArtistName = artist.releases.length > 0 ? artist.releases[0].primaryArtist : artist.stageName;
            return (
              <option key={artist.id} value={artist.id}>
                {primaryArtistName}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Period (Month/Year) *</label>
          <input 
            required 
            type="month" 
            value={monthYear} 
            onChange={(e) => setMonthYear(e.target.value)} 
            className="w-full bg-white/60 border border-white/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-gray-800 font-medium" 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1 pt-2">
          <label className="text-sm font-bold text-gray-900">Total Revenue (IDR) *</label>
          <input required name="totalRevenue" type="number" step="1" value={revenue} onChange={(e) => setRevenue(e.target.value ? Number(e.target.value) : "")} className="w-full bg-white/60 border border-white/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-gray-900 font-black text-lg" placeholder="0" />
        </div>
        <div className="space-y-1 pt-2">
          <label className="text-sm font-bold text-gray-900">Potongan / Cut (%)</label>
          <input name="cutPercentage" type="number" step="0.1" min="0" max="100" value={cut} onChange={(e) => setCut(e.target.value ? Number(e.target.value) : "")} className="w-full bg-white/60 border border-white/80 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-purple-700 font-black text-lg" placeholder="0" />
        </div>
      </div>

      {typeof revenue === "number" && revenue > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100/50 p-4 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <span className="text-sm font-bold text-purple-900 relative z-10">Sisa Bersih (Yang Masuk Database):</span>
          <span className="text-xl font-black text-purple-700 relative z-10">Rp {Math.round(finalRevenue).toLocaleString('id-ID')}</span>
        </div>
      )}

      <div className="pt-6 border-t border-gray-100/50">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Stream Counts (Optional)
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { name: "spotifyStreams", label: "Spotify" },
            { name: "appleMusicStreams", label: "Apple Music" },
            { name: "youtubeStreams", label: "YouTube" },
            { name: "tiktokStreams", label: "TikTok" },
            { name: "facebookStreams", label: "Facebook" },
            { name: "instagramStreams", label: "Instagram" },
            { name: "amazonStreams", label: "Amazon" },
            { name: "otherStreams", label: "Other" }
          ].map(field => (
            <div key={field.name}>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">{field.label}</label>
              <input name={field.name} type="number" defaultValue={0} className="w-full bg-white/40 border border-white/60 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition-all font-mono text-gray-700" />
            </div>
          ))}
        </div>
      </div>

      {result?.error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {result.error}
        </div>
      )}

      {result?.success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Data royalti berhasil disimpan!
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {isPending ? "Menyimpan..." : "Save Royalty Data"}
      </button>
    </form>
  );
}