"use client";

import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { TOrder } from "@/types/order.type";
import { TRating } from "@/types/rating.type";
import { format } from "date-fns";
import { BikeIcon, StarIcon, UtensilsIcon } from "lucide-react";
import Image from "next/image";

interface IProps {
  order: TOrder;
  ratings: TRating[];
  /** False when the ratings request failed (the order still says it's rated). */
  loaded: boolean;
}

// `targetId` is populated differently per rating type: a product
// ({ name: { en, pt }, image }) or a rider ({ name: { firstName, lastName } }).
type TPopulated = {
  name?: string | { en?: string; pt?: string; firstName?: string; lastName?: string };
  image?: string;
};

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-1.5" aria-label={`${value} / 5`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon
            key={i}
            aria-hidden
            className={cn(
              "w-4 h-4",
              i <= rounded
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200",
            )}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-900">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

const formatDate = (date?: Date | string) => {
  if (!date) return "";
  try {
    return format(new Date(date), "dd MMM yyyy, hh:mm a");
  } catch {
    return "";
  }
};

/**
 * What the customer said about this order: the food (one rating per rated
 * product) and the rider, each with stars and the comment. Shown only on a
 * rated order; the stars live in `/ratings`, not on the order.
 */
export default function OrderRatings({ order, ratings, loaded }: IProps) {
  const { t, lang } = useTranslation();

  if (!order?.isRated && ratings.length === 0) return null;

  const productRatings = ratings.filter((r) => r.ratingType === "PRODUCT");
  const riderRatings = ratings.filter(
    (r) => r.ratingType === "DELIVERY_PARTNER",
  );
  const vendorRatings = ratings.filter((r) => r.ratingType === "VENDOR");

  const productName = (r: TRating) => {
    const p = (r.productId ?? r.targetId) as unknown as TPopulated;
    const n = p?.name;
    if (typeof n === "string") return n;
    return (lang === "pt" ? n?.pt || n?.en : n?.en || n?.pt) || t("product");
  };
  const productImage = (r: TRating) =>
    ((r.productId ?? r.targetId) as unknown as TPopulated)?.image;

  const riderName = (r: TRating) => {
    const n = (r.targetId as unknown as TPopulated)?.name;
    if (n && typeof n === "object" && (n.firstName || n.lastName))
      return `${n.firstName ?? ""} ${n.lastName ?? ""}`.trim();
    return t("delivery_partner");
  };

  const renderComment = (r: TRating) =>
    r.review?.trim() ? (
      <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap break-words bg-gray-50 rounded-md px-3 py-2">
        “{r.review.trim()}”
      </p>
    ) : (
      <p className="mt-2 text-sm italic text-gray-400">{t("no_comment")}</p>
    );

  const notRated = (
    <p className="text-sm italic text-gray-400">{t("not_rated_yet")}</p>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
        <StarIcon className="w-5 h-5 text-[#DC3173]" />
        <h3 className="font-semibold text-gray-900">{t("customer_rating")}</h3>
      </div>

      {!loaded && ratings.length === 0 ? (
        <p className="p-6 text-sm text-amber-700">{t("rating_load_failed")}</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {/* FOOD */}
          <section className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3 text-gray-500 text-xs font-semibold uppercase tracking-wide">
              <UtensilsIcon className="w-4 h-4 text-[#DC3173]" />
              {t("food_rating")}
            </div>
            {productRatings.length === 0 ? (
              notRated
            ) : (
              <ul className="space-y-4">
                {productRatings.map((r) => {
                  const img = productImage(r);
                  return (
                    <li key={r._id} className="flex gap-3">
                      {img ? (
                        <Image
                          src={img}
                          alt=""
                          width={44}
                          height={44}
                          className="w-11 h-11 rounded-md object-cover shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-md bg-gray-100 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                          <span className="font-medium text-gray-900">
                            {productName(r)}
                          </span>
                          <Stars value={r.rating} />
                        </div>
                        {renderComment(r)}
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(r.createdAt)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* RIDER (delivery orders only) */}
          {(order?.fulfillmentType !== "PICKUP" || riderRatings.length > 0) && (
            <section className="px-6 py-4">
              <div className="flex items-center gap-2 mb-3 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                <BikeIcon className="w-4 h-4 text-[#DC3173]" />
                {t("rider_rating")}
              </div>
              {riderRatings.length === 0 ? (
                notRated
              ) : (
                <ul className="space-y-4">
                  {riderRatings.map((r) => (
                    <li key={r._id}>
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                        <span className="font-medium text-gray-900">
                          {riderName(r)}
                        </span>
                        <Stars value={r.rating} />
                      </div>
                      {renderComment(r)}
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(r.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* VENDOR (none exist yet; shown if the backend starts sending them) */}
          {vendorRatings.length > 0 && (
            <section className="px-6 py-4">
              <div className="mb-3 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                {t("vendor")}
              </div>
              <ul className="space-y-4">
                {vendorRatings.map((r) => (
                  <li key={r._id}>
                    <Stars value={r.rating} />
                    {renderComment(r)}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
