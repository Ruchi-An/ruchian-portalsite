import { ChevronLeft, ChevronRight } from "lucide-react";

export const ITEMS_PER_PAGE = 50;

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalItems,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination" aria-label="ページ送り">
      <button
        type="button"
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="前のページ"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="pagination-status" aria-live="polite">
        {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="次のページ"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
