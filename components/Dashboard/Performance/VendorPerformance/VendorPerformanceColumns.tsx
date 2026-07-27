
import { Column } from "@/components/common/ReusableTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TVendorPerformance } from "@/types/performance.type";
import {
  Cog,
  EuroIcon,
  MoreVertical,
  PackageIcon,
  StarIcon,
  StoreIcon,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetVendorPerformanceColumnsParams {
  t: TFunction;
  router: AppRouterInstance;
}

export function getVendorPerformanceColumns({
  t,
  router,
}: GetVendorPerformanceColumnsParams): Column<TVendorPerformance>[] {
  return [
    {
      header: (
        <div className="text-[#DC3173] flex gap-2 items-center">
          <StoreIcon className="w-4" />
          {t("vendor")}
        </div>
      ),
      accessor: (vendor) => (
        <div className="flex gap-4 items-center">
          <Avatar className="w-8 h-8">
            <AvatarImage src={vendor.profilePhoto} />
            <AvatarFallback>
              {vendor.businessDetails?.businessName
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3>{vendor.businessDetails?.businessName}</h3>
            <p className="text-gray-700 text-sm">{vendor.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: (
        <div className="text-[#DC3173] flex gap-2 items-center">
          <PackageIcon className="w-4" />
          {t("orders_capital")}
        </div>
      ),
      accessor: (vendor) => vendor.totalOrders || 0,
    },
    {
      header: (
        <div className="text-[#DC3173] flex gap-2 items-center">
          <EuroIcon className="w-4" />
          {t("revenue")}
        </div>
      ),
      accessor: (vendor) => `€${vendor.totalRevenue || 0}`,
    },
    {
      header: (
        <div className="text-[#DC3173] flex gap-2 items-center">
          <StarIcon className="w-4" />
          {t("rating")}
        </div>
      ),
      accessor: (vendor) => vendor.rating?.average || 0,
    },
    {
      header: (
        <div className="text-[#DC3173] flex gap-2 items-center justify-end">
          <Cog className="w-4" />
          {t("actions")}
        </div>
      ),
      className: "text-right",
      accessor: (vendor) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                router.push("/admin/vendor-performance/" + vendor.userId)
              }
            >
              {t("view")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}