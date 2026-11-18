"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/use-translation";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment } from "react";

type TMenuKey = "create-offer" | "offers";

interface IProps {
    /** The vendor's userId, same value the other vendor routes use */
    vendorId: string;
    /** Hide the entry for the page you are already on */
    hide?: TMenuKey[];
}

export default function VendorProductActionsMenu({ vendorId, hide = [] }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const base = `/admin/vendor/${vendorId}`;

    const groups: { key: string; path: string; label: string }[][] = [
        [
            { key: "manage-products", path: "manage-products", label: t("manage_products") || "Manage Product" },
            { key: "add-product", path: "add-product", label: t("add_product") || "Add Product" },
            { key: "update-discount", path: "products/update-discount", label: t("update_discounts") || "Update Discount" },
            { key: "increase-price", path: "products/increase-price", label: t("increase_prices") || "Increase Price" },
        ],
        [
            { key: "categories", path: "products/categories", label: t("product_categories") || "Product Categories" },
            { key: "create-offer", path: "products/offers/create-new", label: t("create_new_offer") || "Create New Offer" },
            { key: "offers", path: "products/offers", label: t("created_offers") || "Created Offers" },
            { key: "variations", path: "products/variation-management", label: t("variation_management") || "Variation Management" },
            { key: "add-ons", path: "products/add-ons", label: t("add_ons") || "Add-ons" },
        ],
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2 bg-[#DC3173] text-white hover:bg-[#DC3173]/90">
                    {t("actions") || "Actions"}
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-52 rounded-lg border bg-white p-1 shadow-lg"
            >
                {groups.map((items, i) => (
                    <Fragment key={i}>
                        {i > 0 && <DropdownMenuSeparator className="my-1 border-gray-100" />}
                        {items
                            .filter((item) => !hide.includes(item.key as TMenuKey))
                            .map((item) => (
                                <DropdownMenuItem
                                    key={item.key}
                                    onClick={() => router.push(`${base}/${item.path}`)}
                                    className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    {item.label}
                                </DropdownMenuItem>
                            ))}
                    </Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}