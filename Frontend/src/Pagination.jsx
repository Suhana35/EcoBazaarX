import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * Reusable Pagination component
 *
 * Props:
 *   currentPage   – 1-based current page number
 *   totalPages    – total number of pages
 *   totalItems    – total item count (for "Showing X–Y of Z")
 *   itemsPerPage  – items shown per page
 *   onPageChange  – (page, newItemsPerPage?) => void
 *   pageSizeOptions – array of numbers, default [5, 10, 20, 50]
 *   className     – optional wrapper class override
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = "",
}) => {
  if (totalPages <= 1 && totalItems <= Math.min(...pageSizeOptions)) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Smart page number list with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-gray-200 ${className}`}
    >
      {/* Info text */}
      <p className="text-sm text-gray-500 whitespace-nowrap">
        Showing{" "}
        <span className="font-semibold text-gray-700">{startItem}–{endItem}</span>{" "}
        of <span className="font-semibold text-gray-700">{totalItems}</span>
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            bg-white border border-gray-200 text-gray-600 shadow-sm
            hover:bg-[#00b4d8] hover:text-white hover:border-[#00b4d8]"
        >
          <FiChevronLeft />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-gray-400 text-sm select-none"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 border shadow-sm
                  ${
                    currentPage === page
                      ? "bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white border-transparent scale-105 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-[#e0f7fa] hover:text-[#0077b6]"
                  }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            bg-white border border-gray-200 text-gray-600 shadow-sm
            hover:bg-[#00b4d8] hover:text-white hover:border-[#00b4d8]"
        >
          <span className="hidden sm:inline">Next</span>
          <FiChevronRight />
        </button>
      </div>

      {/* Items-per-page selector */}
      <select
        value={itemsPerPage}
        onChange={(e) => onPageChange(1, parseInt(e.target.value))}
        aria-label="Items per page"
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700
          focus:outline-none focus:border-[#00b4d8] shadow-sm cursor-pointer"
      >
        {pageSizeOptions.map((n) => (
          <option key={n} value={n}>
            {n} per page
          </option>
        ))}
      </select>
    </div>
  );
};

export default Pagination;
