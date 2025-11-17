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
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type PaginationProps = {
  totalPages: number;
  itemsNoArray?: number[];
};

export default function PaginationComponent({
  totalPages,
  itemsNoArray = [10, 20, 50, 100],
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { currentPage, paginationItemsToDisplay } = {
    currentPage: Number(searchParams.get("page") || 1),
    paginationItemsToDisplay: Number(searchParams.get("limit") || 10),
  };

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
  });

  const handlePreviousPage = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentPage > 1) {
      params.set("page", `${currentPage - 1}`);
      router.push(`?${params.toString()}`);
    }
  };

  const handleNextPage = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentPage !== totalPages) {
      params.set("page", `${currentPage + 1}`);
      router.push(`?${params.toString()}`);
    }
  };

  const handleOnClickPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", `${page}`);
    router.push(`?${params.toString()}`);
  };

  const handleChangeItemsPerPage = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    startTransition(() => {
      params.set("limit", val);
      router.push(`?${params.toString()}`);
    });
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
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50 cursor-pointer"
                onClick={() => handlePreviousPage()}
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
                    "hover:bg-[#DC3173]/90 hover:text-white cursor-pointer",
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
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50 cursor-pointer"
                onClick={() => handleNextPage()}
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
          disabled={isPending}
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
