"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { resolveMediaUrl } from "@/lib/r2";

type Artist = {
  id: string;
  userId: string;
  stageName: string;
  avatarUrl: string | null;
  createdAt: Date;
  releases: any[];
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
};

export function AllArtistsClient({ artists }: { artists: Artist[] }) {
  const router = useRouter();
  const [slidingId, setSlidingId] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const ITEMS_PER_PAGE = 10;

  const filteredArtists = useMemo(() => {
    if (!searchQuery) return artists;
    const lowerQuery = searchQuery.toLowerCase();
    return artists.filter(a => 
      a.stageName.toLowerCase().includes(lowerQuery) || 
      (a.user?.name && a.user.name.toLowerCase().includes(lowerQuery)) ||
      (a.user?.email && a.user.email.toLowerCase().includes(lowerQuery))
    );
  }, [artists, searchQuery]);

  const totalPages = Math.ceil(filteredArtists.length / ITEMS_PER_PAGE);
  const paginatedArtists = filteredArtists.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleClick = (artist: Artist) => {
    if (slidingId) return; // prevent double click
    setSlidingId(artist.id);
    setIsExiting(true);
    // After slide-out animation (350ms), navigate
    setTimeout(() => {
      router.push(`/admin/artists/${artist.userId}`);
    }, 350);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="relative max-w-sm sticky left-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari artis atau email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
        />
      </div>

      <div
        className={`min-w-[900px] space-y-3 transition-all duration-350 ease-in-out ${
        isExiting ? "opacity-0 translate-x-[-40px]" : "opacity-100 translate-x-0"
      }`}
      style={{ transition: "opacity 350ms cubic-bezier(0.4,0,0.2,1), transform 350ms cubic-bezier(0.4,0,0.2,1)" }}
    >
      {/* Table Header */}
      <div className="flex items-center px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
        <div className="w-20">ID</div>
        <div className="flex-1">Stage Name</div>
        <div className="flex-1">Managed By (User)</div>
        <div className="w-32 text-center">Releases</div>
        <div className="w-40">Created At</div>
      </div>

      {artists.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No artists found.
        </div>
      )}

      {/* Artist Rows */}
      {paginatedArtists.map((artist, i) => (
        <div
          key={artist.id}
          onClick={() => handleClick(artist)}
          className="flex items-center px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer group"
          style={{
            transition: `transform 350ms cubic-bezier(0.4,0,0.2,1) ${i * 30}ms, opacity 350ms cubic-bezier(0.4,0,0.2,1) ${i * 30}ms, box-shadow 200ms ease, background-color 200ms ease`,
            transform: isExiting ? "translateX(-60px) scale(0.97)" : "translateX(0) scale(1)",
            opacity: isExiting ? 0 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isExiting) {
              (e.currentTarget as HTMLElement).style.transform = "translateX(6px) scale(1.01)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(59,130,246,0.12)";
              (e.currentTarget as HTMLElement).style.backgroundColor = "#f0f7ff";
            }
          }}
          onMouseLeave={(e) => {
            if (!isExiting) {
              (e.currentTarget as HTMLElement).style.transform = "translateX(0) scale(1)";
              (e.currentTarget as HTMLElement).style.boxShadow = "";
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
            }
          }}
        >
          <div className="w-20 text-gray-500 font-medium text-sm">
            #{artist.id.slice(-4).toUpperCase()}
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 w-max">
              {artist.avatarUrl || artist.user.image ? (
                <img
                  src={resolveMediaUrl(artist.avatarUrl) || resolveMediaUrl(artist.user.image)!}
                  alt={artist.stageName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.stageName}`}
                  alt={artist.stageName}
                  className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0"
                />
              )}
              <span className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {artist.stageName}
              </span>
            </div>
          </div>

          <div className="flex-1 text-gray-500 text-sm pr-4 truncate flex flex-col">
            <span className="font-medium text-gray-700">{artist.user.name || "Unknown"}</span>
            <span className="text-xs">{artist.user.email}</span>
          </div>

          <div className="w-32 text-center font-semibold text-gray-900">
            {artist.releases.length}
          </div>

          <div className="w-40 text-gray-500 text-sm flex items-center justify-between">
            <span>{new Date(artist.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
            {/* Arrow indicator */}
            <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      ))}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, artists.length)}</span> of <span className="font-medium text-gray-900">{artists.length}</span> artists
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              &lt;
            </button>
            <div className="flex gap-1 items-center px-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-[#98d249] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
