"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

type DataPaginationProps = {
  page: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
  totalItems: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export default function DataPagination({
  page,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  totalItems,
  loading = false,
  onPageChange,
  onPageSizeChange,
}: DataPaginationProps) {
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;

  const endItem = Math.min(page * pageSize, totalItems);

  useEffect(() => {
    if (!pageSizeOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setPageSizeOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPageSizeOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pageSizeOpen]);

  useEffect(() => {
    if (pageSizeOpen) {
      setPageSizeOpen(false);
    }
  }, [page, pageSize]);

  if (loading || totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 bg-[#f7faf9] px-5 py-2 text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      {/* Rows per page */}
      <div className="flex items-center gap-2">
        <label className="whitespace-nowrap text-sm text-slate-500">
          Rows per page
        </label>

        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={pageSizeOpen}
            onClick={() => setPageSizeOpen((open) => !open)}
            className="inline-flex h-8 min-w-19 items-center justify-between gap-3 rounded-md border border-[#D5E7E4] bg-white px-3 text-sm font-medium text-[#007F70] outline-none transition-colors hover:border-[#008577] hover:bg-[#E5F5F2] focus-visible:ring-2 focus-visible:ring-[#008577]/30"
          >
            {pageSize}

            <svg
              className={`h-4 w-4 transition-transform ${
                pageSizeOpen ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m5 7.5 5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {pageSizeOpen && (
            <div
              role="listbox"
              aria-label="Rows per page"
              className="absolute bottom-full left-0 z-50 mb-2 min-w-25 overflow-hidden rounded-lg border border-[#D5E7E4] bg-white p-1 shadow-lg shadow-[#003B3B]/10"
            >
              {pageSizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  role="option"
                  aria-selected={pageSize === size}
                  onClick={() => {
                    onPageSizeChange(size);
                    setPageSizeOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    pageSize === size
                      ? "bg-[#E5F5F2] font-semibold text-[#007F70]"
                      : "text-slate-600 hover:bg-[#F0F9F8] hover:text-[#007F70]"
                  }`}
                >
                  {size}

                  {pageSize === size && (
                    <Check size={15} className="text-[#008577]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-500">
        Showing{" "}
        <strong className="font-semibold text-slate-700">
          {startItem}–{endItem}
        </strong>{" "}
        of{" "}
        <strong className="font-semibold text-slate-700">{totalItems}</strong>{" "}
        records
      </p>

      {/* Previous / Next */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center justify-center rounded-md border border-[#D5E7E4] bg-white px-3 py-1.5 text-[#007F70] transition-colors hover:border-[#008577] hover:bg-[#E5F5F2] hover:text-[#006B60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008577]/30 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:hover:border-slate-200 disabled:hover:bg-slate-50"
        >
          <ArrowLeft size={15} />
        </button>

        <span
          className="min-w-16 text-center text-xs font-medium text-slate-600"
          aria-live="polite"
        >
          {page} / {totalPages}
        </span>

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center justify-center rounded-md border border-[#D5E7E4] bg-white px-3 py-1.5 text-[#007F70] transition-colors hover:border-[#008577] hover:bg-[#E5F5F2] hover:text-[#006B60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008577]/30 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:hover:border-slate-200 disabled:hover:bg-slate-50"
        >
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
