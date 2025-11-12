import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

type PaginationProps<T> = {
  currentPage: number;
  totalPages: number;
  paginationItemsToDisplay?: number;
  itemsNoArray?: number[];
  setQueryParams: React.Dispatch<React.SetStateAction<T>>;
};

export default function PaginationCard<T>({
  currentPage,
  totalPages,
  paginationItemsToDisplay = 10,
  setQueryParams,
  itemsNoArray = [10, 20, 50, 100],
}: PaginationProps<T>) {
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
  });

  const handlePreviousPage = () => {
    if (currentPage !== 1) {
      setQueryParams((prevQuery) => ({ ...prevQuery, page: currentPage - 1 }));
    }
  };

  const handleNextPage = () => {
    if (currentPage !== totalPages) {
      setQueryParams((prevQuery) => ({ ...prevQuery, page: currentPage + 1 }));
    }
  };

  const handleOnClickPage = (page: number) => {
    setQueryParams((prevQuery) => ({ ...prevQuery, page }));
  };

  const handleChangeItemsPerPage = (val: string) => {
    setQueryParams((prevQuery) => ({ ...prevQuery, limit: Number(val) }));
  };

  return (
    <div className="lg:flex items-center justify-between gap-3 py-4 lg:py-0">
      <p
        className="text-muted-foreground flex-1 text-sm whitespace-nowrap text-center lg:text-left"
        aria-live="polite"
      >
        Page <span className="text-[#DC3173] font-semibold">{currentPage}</span>{" "}
        of <span className="text-foreground">{totalPages}</span>
      </p>
      <div className="grow my-4 lg:my-0">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={handlePreviousPage}
                aria-label="Go to previous page"
                aria-disabled={currentPage === 1 ? true : undefined}
                role={currentPage === 1 ? "link" : undefined}
              >
                <ChevronLeftIcon size={16} aria-hidden="true" />
              </PaginationLink>
            </PaginationItem>
            {showLeftEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handleOnClickPage(page)}
                  isActive={page === currentPage}
                  className={cn(
                    page === currentPage && "bg-[#DC3173] text-white"
                  )}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            {showRightEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={handleNextPage}
                aria-label="Go to next page"
                aria-disabled={currentPage === totalPages ? true : undefined}
                role={currentPage === totalPages ? "link" : undefined}
              >
                <ChevronRightIcon size={16} aria-hidden="true" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <div className="flex flex-1 justify-center lg:justify-end">
        <Select
          defaultValue={paginationItemsToDisplay.toLocaleString()}
          aria-label="Results per page"
          onValueChange={handleChangeItemsPerPage}
        >
          <SelectTrigger
            id="results-per-page"
            className="w-fit whitespace-nowrap text-[#DC3173] border-[#DC3173]"
          >
            <SelectValue placeholder="Select number of results" />
          </SelectTrigger>
          <SelectContent>
            {itemsNoArray.map((itemsNo) => (
              <SelectItem key={itemsNo} value={String(itemsNo)}>
                {itemsNo} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
