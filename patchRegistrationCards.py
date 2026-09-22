import sys

file_path = 'src/app/admin/registrations/RegistrationCards.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

replacement1 = """  const [docViewer, setDocViewer] = useState<{ url: string; label: string } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(visibleCards.length / ITEMS_PER_PAGE);
  const paginatedCards = visibleCards.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const removeCard = useCallback((id: string) => {"""

target1 = """  const [docViewer, setDocViewer] = useState<{ url: string; label: string } | null>(null);

  const removeCard = useCallback((id: string) => {"""

replacement2 = """      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedCards.map((card) => ("""

target2 = """      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleCards.map((card) => ("""

replacement3 = """          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, visibleCards.length)}</span> of <span className="font-medium text-gray-900">{visibleCards.length}</span> registrations
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white transition-colors border border-gray-200"
            >
              &lt;
            </button>
            <div className="flex gap-1 items-center px-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-[#98d249] text-white shadow-md border-transparent' : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white transition-colors border border-gray-200"
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Card Detail Modal */}"""

target3 = """          </div>
        ))}
      </div>

      {/* Card Detail Modal */}"""

code = code.replace(target1, replacement1)
code = code.replace(target2, replacement2)
code = code.replace(target3, replacement3)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Pagination added successfully!")
