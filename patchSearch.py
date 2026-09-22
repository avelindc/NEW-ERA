import sys

file_path = 'src/app/admin/all-artists/AllArtistsClient.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

replacement_imports = """import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";"""

target_imports = """import { useState } from "react";
import { useRouter } from "next/navigation";"""

code = code.replace(target_imports, replacement_imports)

replacement_state = """  const [isExiting, setIsExiting] = useState(false);
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
  const paginatedArtists = filteredArtists.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);"""

target_state = """  const [isExiting, setIsExiting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalPages = Math.ceil(artists.length / ITEMS_PER_PAGE);
  const paginatedArtists = artists.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);"""

code = code.replace(target_state, replacement_state)

replacement_ui = """  return (
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
        className={`min-w-[900px] space-y-3 transition-all duration-350 ease-in-out ${"""

target_ui = """  return (
    <div
      className={`min-w-[900px] space-y-3 transition-all duration-350 ease-in-out ${"""

code = code.replace(target_ui, replacement_ui)

replacement_end = """        </div>
      )}
    </div>
  );
}"""

target_end = """        </div>
      )}
    </div>
  );
}"""

code = code.replace(target_end, """        </div>
      )}
    </div>
    </div>
  );
}""")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Search bar added to AllArtistsClient!")
