'use client';

import TitleHeader from '@/components/TitleHeader/TitleHeader';
import { useTranslation } from '@/hooks/use-translation';
import { TOffer } from '@/types/offer.type';
import { format } from "date-fns";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface IProps {
    offerData: TOffer[];
    vendorId: string;
}

const VendorCreatedOffers = ({ offerData, vendorId }: IProps) => {
    const { t, lang } = useTranslation();
    const router = useRouter();

    return (
        <>
            <TitleHeader
                title={t("created_offers")}
                subtitle={t("manage_all_offers_here")}
                onBackClick={() => router.back()}
                extraComponent={
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-[#DC3173] hover:bg-[#DC3173]/90 text-white flex items-center gap-2">
                                {t("actions") || "Actions"}
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 bg-white shadow-lg border rounded-lg p-1"
                        >
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(`/admin/vendor/${vendorId}/manage-products`)
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("manage_products") || "Manage Product"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(`/admin/vendor/${vendorId}/add-product`)
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("add_product") || "Add Product"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorId}/products/update-discount`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("update_discounts") || "Update Discount"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorId}/products/increase-price`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("increase_prices") || "Increase Price"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 border-gray-100" />

                            {/* Newly added sections */}
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorId}/products/categories`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("product_categories") || "Product Categories"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorId}/products/add-ons`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("add_ons") || "Add-ons"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offerData?.map((offer) => (
                    <div
                        key={offer._id}
                        className="flex flex-col gap-2 border rounded-md p-4"
                    >
                        <p className="text-gray-500">{offer.title?.[lang]}</p>
                        {offer.offerType === "BOGO" && <p>{t("bogo_offer")}</p>}
                        {offer.offerType === "PERCENT" && (
                            <p>{t("percentage_offer")} ({offer.discountValue}% {t("off")})</p>
                        )}
                        {offer.offerType === "FLAT" && (
                            <p>{t("flat_offer")} (€{offer.discountValue} {t("off")})</p>
                        )}
                        <p className="text-xs">
                            {offer.validFrom
                                ? format(offer.validFrom, "dd/MM/yyyy")
                                : "N/A"}
                            {" - "}
                            {offer.expiresAt
                                ? format(offer.expiresAt, "dd/MM/yyyy")
                                : "N/A"}
                        </p>
                    </div>
                ))}

                {offerData?.length === 0 && (
                    <p className="text-gray-500 italic">{t("no_offers_created")}</p>
                )}
            </div>
            {offerData?.length > 0 && (
                <div className="text-center mt-2">
                    <Link
                        className="text-[#DC3173] text-sm font-medium hover:underline"
                        href={`/admin/vendor/offers/${vendorId}`}
                    >
                        {t("view_all")}
                    </Link>
                </div>
            )}
        </>
    );
};

export default VendorCreatedOffers;