export const dynamic = "force-dynamic";

import ProductImport from "@/components/Dashboard/Vendors/VendorDetails/Products/Import/ProductImport";
import { getAllProductCategories } from "@/services/dashboard/category/product-category.service";
import { getAllTaxes } from "@/services/dashboard/tax/tax.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TProductCategory } from "@/types/category.type";
import { TTax } from "@/types/tax.type";
import { TVendor } from "@/types/user.type";
import { queryStringFormatter } from "@/utils/formatter";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

/**
 * Import products (CSV / XLSX) into one vendor's catalogue
 * (PRODUCT_BULK_AND_IMPORT_FRONTEND_GUIDE §3, plan.md A3).
 * Opened from Manage Products → Actions → Import products.
 */
const ImportProductsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const vendor: TVendor = await getSingleVendorReq(id);
  const query = queryStringFormatter({ vendorId: vendor?._id, isActive: true, limit: "200" });
  const [categories, taxes] = await Promise.all([getAllProductCategories(query), getAllTaxes()]);

  // The signed-in admin, so a saved import job is only resumed by the admin who started it.
  let adminId = "admin";
  try {
    const token = (await cookies()).get("accessToken")?.value;
    if (token) adminId = (jwtDecode(token) as { userId?: string }).userId || adminId;
  } catch {
    /* unreadable token: the page still works, the job is kept under "admin" */
  }

  const vendorUserId = vendor?.userId ?? id;

  return (
    <ProductImport
      vendorKey={`${adminId}:${vendorUserId}`}
      vendorMongoId={vendor?._id as string}
      vendorUserId={vendorUserId}
      vendorName={vendor?.businessDetails?.businessName || vendorUserId}
      isRestaurant={vendor?.businessDetails?.businessTypeSlug === "restaurant"}
      categories={((categories?.data ?? []) as TProductCategory[])
        .filter((c) => c?.isActive !== false && (c?.name?.en || c?.name?.pt))
        .map((c) => ({ nameEn: c.name?.en ?? "", namePt: c.name?.pt ?? "" }))}
      taxRates={Array.from(
        new Set(
          ((taxes?.data ?? []) as (TTax & { isActive?: boolean })[])
            .filter((tax) => tax.isActive !== false)
            .map((tax) => Number(tax.taxRate)),
        ),
      ).sort((a, b) => b - a)}
    />
  );
};

export default ImportProductsPage;
