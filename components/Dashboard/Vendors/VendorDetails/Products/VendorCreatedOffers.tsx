'use client';

import TitleHeader from '@/components/TitleHeader/TitleHeader';
import { useTranslation } from '@/hooks/use-translation';
import { TOffer } from '@/types/offer.type';
import { format } from "date-fns";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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