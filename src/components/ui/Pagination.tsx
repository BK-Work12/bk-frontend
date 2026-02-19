'use client';

import Image from 'next/image';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const visiblePages = 4;

  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, startPage + visiblePages - 1);

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="flex max-w-[297.05999755859375px] w-full text-black items-center gap-1">
      {/* Previous */}
      {/* Previous */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-8 h-8 disabled:opacity-40 flex items-center justify-center rounded-md text-lg"
      >
        <Image width={20} height={20} src="/assets/paginationArrow.svg" alt="" className="rotate-180" />
      </button>

      {/* First page */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
          >
            1
          </button>
          <span className="px-1">…</span>
        </>
      )}

      {/* Pages */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm
            ${page === currentPage ? 'bg-[#53A7FF30]  font-medium' : 'font-medium hover:bg-gray-100'}`}
        >
          {page}
        </button>
      ))}

      {/* Last page */}
      {endPage < totalPages && (
        <>
          <span className="px-1">…</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-8 h-8 disabled:opacity-[0.32%] flex items-center justify-center rounded-md text-lg"
      >
        <Image width={20} height={20} src={'/assets/paginationArrow.svg'} alt="" />
      </button>
    </div>
  );
}
