"use client";

import { useState } from "react";
import Link from "next/link";
import { Ban } from "lucide-react";
import { ArtistActionButtons } from "./ArtistActionButtons";
import { updateArtistStatusAction } from "@/app/actions/admin";
import { resolveMediaUrl } from "@/lib/r2";

type UserType = any;

export function AdminArtistsClient({ pendingUsers, approvedUsers }: { pendingUsers: UserType[], approvedUsers: UserType[] }) {
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const currentList = activeTab === "pending" ? pendingUsers : approvedUsers;
  const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE);
  const paginatedList = currentList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleTabChange = (tab: "pending" | "approved") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSuspend = async (user: UserType) => {
    await updateArtistStatusAction(user.id, "SUSPENDED", user.name || "Artist", user.email);
    // Ideally we should mutate or refresh, but server action revalidates path
  };

  return (
    <div className="mb-8 bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-full overflow-hidden">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Artist Approvals</h1>
      <p className="text-gray-500 text-xs sm:text-sm">{currentList.length} users found in {activeTab}</p>

      <div className="flex items-center gap-6 mt-8 border-b border-gray-100 pb-4">
        <button 
          onClick={() => handleTabChange("pending")}
          className={`font-bold pb-4 -mb-[18px] transition-colors ${activeTab === 'pending' ? 'text-gray-900 border-b-2 border-blue-600' : 'text-gray-400 font-medium border-b-2 border-transparent hover:text-gray-600'}`}
        >
          Pending ({pendingUsers.length})
        </button>
        <button 
          onClick={() => handleTabChange("approved")}
          className={`font-bold pb-4 -mb-[18px] transition-colors ${activeTab === 'approved' ? 'text-gray-900 border-b-2 border-blue-600' : 'text-gray-400 font-medium border-b-2 border-transparent hover:text-gray-600'}`}
        >
          Approved ({approvedUsers.length})
        </button>
      </div>

      <div className="mt-8 overflow-x-auto pb-4 scrollbar-hide">
        <div className="min-w-[900px] space-y-3">
          {/* Table Header */}
          <div className="flex items-center px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="w-20">Id</div>
            <div className="flex-1">Name / Primary Artist</div>
            <div className="flex-1">Email</div>
            <div className="w-32">Date</div>
            <div className="w-32">Status</div>
            <div className="w-32 flex justify-end">Action</div>
          </div>

          {/* Rows */}
          {paginatedList.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition hover:bg-blue-600 hover:border-blue-600 hover:shadow-blue-500/20 group cursor-pointer"
            >
              <div className="w-20 text-gray-500 font-medium text-sm group-hover:text-blue-100">
                #{user.id.slice(-4).toUpperCase()}
              </div>
              
              <div className="flex-1 pr-4">
                <Link href={`/admin/artists/${user.id}`} className="flex items-center gap-3 w-max" onClick={(e) => e.stopPropagation()}>
                  <img src={resolveMediaUrl(user.image) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Profile" className="w-8 h-8 rounded-full bg-gray-100 object-cover flex-shrink-0" />
                  <span className="font-bold text-gray-900 group-hover:text-white transition truncate hover:underline">{user.artists?.[0]?.stageName || user.name}</span>
                </Link>
              </div>
              
              <div className="flex-1 text-gray-500 text-sm group-hover:text-blue-100 pr-4 truncate">
                {user.email}
              </div>
              
              <div className="w-32 text-gray-500 text-sm group-hover:text-blue-100">
                {new Date(activeTab === 'pending' ? user.createdAt : user.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              
              <div className="w-32 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'pending' ? 'bg-red-400 group-hover:bg-red-300' : 'bg-green-400 group-hover:bg-green-300'}`}></span>
                <span className={`font-medium text-sm ${activeTab === 'pending' ? 'text-red-400 group-hover:text-red-300' : 'text-green-500 group-hover:text-green-300'}`}>
                  {activeTab === 'pending' ? 'Pending' : 'Approved'}
                </span>
              </div>
              
              <div className="w-32 flex justify-end gap-2">
                {activeTab === 'pending' ? (
                  <ArtistActionButtons 
                    userId={user.id} 
                    userName={user.name || "Artist"} 
                    userEmail={user.email} 
                  />
                ) : (
                  <form action={async () => {
                    await handleSuspend(user);
                  }}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="status" value="SUSPENDED" />
                    <button type="submit" title="Suspend" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 group-hover:text-white group-hover:hover:bg-white/20 transition">
                      <Ban className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
          
          {paginatedList.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No {activeTab} artists found.
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, currentList.length)}</span> of <span className="font-medium text-gray-900">{currentList.length}</span> artists
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              Previous
            </button>
            <div className="flex gap-1 items-center px-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
