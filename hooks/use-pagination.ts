type UsePaginationProps = {
  currentPage: number;
  totalPages: number;
  paginationItemsToDisplay?: number; // default 5
};

type UsePaginationReturn = {
  pages: number[];
  showLeftEllipsis: boolean;
  showRightEllipsis: boolean;
};

export function usePagination({
  currentPage,
  totalPages,
  paginationItemsToDisplay = 5,
}: UsePaginationProps): UsePaginationReturn {
  // If total pages are less than display limit, just show all pages
  if (totalPages <= paginationItemsToDisplay) {
    return {
      pages: Array.from({ length: totalPages }, (_, i) => i + 1),
      showLeftEllipsis: false,
      showRightEllipsis: false,
    };
  }

  const half = Math.floor(paginationItemsToDisplay / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  // Adjust start and end if they go out of bounds
  if (start < 1) {
    start = 1;
    end = paginationItemsToDisplay;
  } else if (end > totalPages) {
    end = totalPages;
    start = totalPages - paginationItemsToDisplay + 1;
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return {
    pages,
    showLeftEllipsis: start > 1,
    showRightEllipsis: end < totalPages,
  };
}
