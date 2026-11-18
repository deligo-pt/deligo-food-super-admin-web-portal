"use client";

import OfferStatusUpdateModal from "@/components/Dashboard/Offers/ActiveCampaigns/OfferStatusUpdateModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import {
  deleteOfferReq,
  updateOfferReq,
} from "@/services/dashboard/offer/offer.service";
import { useStore } from "@/store/store";
import { TOffer } from "@/types/offer.type";
import { getCookie } from "@/utils/cookies";
import { getKnownOfferError } from "@/utils/offer.error";
import { toId } from "@/utils/offer.util";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import {
  ArrowLeftCircle,
  BanIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  GiftIcon,
  LayersIcon,
  PercentIcon,
  PhoneIcon,
  RotateCcwIcon,
  ShieldIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StoreIcon,
  TagIcon,
  TargetIcon,
  TrashIcon,
  TrendingUpIcon,
  UserCheckIcon,
  UsersIcon,
  WalletIcon,
  ZapIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { toast } from "sonner";

interface IProps {
  offer: TOffer;
}

const roleLabel: Record<string, string> = {
  VENDOR: "Vendor",
  SUB_VENDOR: "Sub-vendor",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super admin",
};

const fundedByLabel: Record<string, string> = {
  VENDOR: "Vendor",
  PLATFORM: "Platform",
  ADMIN: "Platform",
};


/** Small label + value tile used by the rule cards */
function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof PercentIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <Icon className="w-4 h-4 text-[#DC3173] mb-2" />
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800 wrap-break-word">
        {value}
      </p>
    </div>
  );
}

/** Collapsible list of ids, for when the API returns ids instead of populated products */
function IdList({ title, ids }: { title: string; ids: string[] }) {
  if (!ids.length) return null;
  return (
    <details className="mt-3 text-sm text-slate-600">
      <summary className="cursor-pointer text-[#DC3173]">
        {title} ({ids.length})
      </summary>
      {/* <ul className="mt-2 flex flex-wrap gap-2">
        {ids.map((id) => (
          <li
            key={id}
            className="rounded-md bg-white px-2 py-1 font-mono text-xs text-slate-700"
          >
            {id}
          </li>
        ))}
      </ul> */}
    </details>
  );
}

export default function OfferDetails({ offer }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { lang } = useStore();

  const [copied, setCopied] = useState(false);
  const [openStatusUpdateModal, setOpenStatusUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const accessToken = getCookie("accessToken");

  const { role } = jwtDecode(accessToken as string) as { role: string };

  const offerTypeConfig: Record<
    string,
    {
      icon: typeof PercentIcon;
      label: string;
      textColor: string;
    }
  > = {
    PERCENT: {
      icon: PercentIcon,
      label: t("offer_type_percent"),
      textColor: "text-amber-700",
    },
    FLAT: {
      icon: TagIcon,
      label: t("offer_type_flat"),
      textColor: "text-emerald-700",
    },
    BOGO: {
      icon: GiftIcon,
      label: t("offer_type_bogo"),
      textColor: "text-purple-700",
    },
    BUY_AND_REWARD: {
      icon: GiftIcon,
      label: t("offer_type_buy_and_reward"),
      textColor: "text-purple-700",
    },
  };

  const config = offerTypeConfig[offer.offerType];
  const IconComponent = config.icon;

  const rewardTypeLabel: Record<string, string> = {
    SAME_PRODUCT: t("reward_type_same_product"),
    FIXED_PRODUCT: t("reward_type_fixed_product"),
    CUSTOMER_CHOICE: t("reward_type_customer_choice"),
  };

  const copyCode = () => {
    if (offer.code) {
      navigator.clipboard.writeText(offer.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDiscountDisplay = () => {
    switch (offer.offerType) {
      case "PERCENT":
        return `${offer.discountValue}%`;
      case "FLAT":
        return `€${offer.discountValue}`;
      case "BOGO":
        return `${offer.bogo?.buyQty}+${offer.bogo?.getQty}`;
      case "BUY_AND_REWARD":
        return `${offer.buyAndReward?.buy.quantity}+${offer.buyAndReward?.reward.quantity}`;
      default:
        return "";
    }
  };

  const usagePercentage = offer.maxUsageCount
    ? ((offer.usageCount || 0) / offer.maxUsageCount) * 100
    : 0;

  const now = new Date();
  const start = offer.validFrom ? new Date(offer.validFrom) : new Date();
  const end = offer.expiresAt ? new Date(offer.expiresAt) : new Date();
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  const timeProgress = Math.min(
    Math.max((elapsed / totalDuration) * 100, 0),
    100,
  );
  const isExpired = now > end;
  const isUpcoming = now < start;

  /* data from the API response */
  const isFirstOrder = offer.eligibility?.type === "FIRST_ORDER";
  const eligibilityScope = offer.eligibility?.scope;
  const isDiscountOffer =
    offer.offerType === "PERCENT" || offer.offerType === "FLAT";
  const vendorName = [offer.vendorId?.name?.firstName, offer.vendorId?.name?.lastName]
    .map((n) => n?.trim())
    .filter(Boolean)
    .join(" ");
  const specificProducts = (offer.scopeProducts ?? []) as unknown[];
  // scopeProducts can be plain ids (as in the API response) or populated documents
  const specificProductIds = specificProducts.map(toId).filter(Boolean);
  const specificProductNames = specificProducts
    .map((p: any) => (typeof p === "object" ? p?.name?.[lang] : undefined))
    .filter(Boolean) as string[];
  const customersUsed = Object.keys(offer.perUserUsage ?? {}).length;
  const br = offer.buyAndReward;
  const buyProductIds = (br?.buy.productIds ?? []).map(toId).filter(Boolean);
  const rewardProductId = toId(br?.reward.productId);
  const rewardOptionIds = (br?.reward.options ?? [])
    .map((o) => toId(o.productId))
    .filter(Boolean);
  const formatDate = (d?: Date | string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      : "-";

  const closeStatusUpdateModal = (open: boolean) => {
    setOpenStatusUpdateModal(open);
  };

  const handleUpdateStatus = async () => {
    const toastId = toast.loading("Updating offer...");
    setButtonDisabled(true);

    const result = await updateOfferReq(offer._id, {
      isActive: !offer.isActive,
    });

    if (result.success) {
      toast.success(result.message || "Offer updated successfully!", {
        id: toastId,
      });
      closeStatusUpdateModal(false);
      router.refresh();
      return;
    }

    // e.g. 409 when another first-order offer is already active
    toast.error(
      getKnownOfferError(result) || result.message || "Offer update failed",
      { id: toastId },
    );
    setButtonDisabled(false);
  };

  const closeDeleteModal = (open: boolean) => {
    setOpenDeleteModal(open);
  };

  const handleDeleteCampaign = async () => {
    const toastId = toast.loading("Deleting Offer...");
    setIsDeleting(true);

    const result = await deleteOfferReq(offer._id);

    if (result.success) {
      toast.success(result.message || "Offer deleted successfully!", {
        id: toastId,
      });
      router.push("/admin/active-campaigns");
      closeDeleteModal(false);
      return;
    }

    toast.error(result.message || "Offer delete failed", { id: toastId });
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <Button
        onClick={() => router.back()}
        variant="link"
        className="inline-flex items-center text-sm gap-2 text-[#DC3173] px-0! py-0 h-4 cursor-pointer"
      >
        <ArrowLeftCircle /> {t("go_back")}
      </Button>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        {/* Deleted banner */}
        {offer.isDeleted && (
          <div className="mt-4 mb-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            <TrashIcon className="w-4 h-4 shrink-0" />
            {t("this_offer_has_been_deleted")}
          </div>
        )}

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl mb-8">
          <div className={`absolute inset-0 bg-[#DC3173] opacity-90`} />

          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <motion.div
                  initial={{
                    scale: 0,
                    rotate: -180,
                  }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    delay: 0.2,
                  }}
                  className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                >
                  <span className="text-4xl font-black text-white">
                    {getDiscountDisplay()}
                  </span>
                </motion.div>
                <div>
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.3,
                    }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <IconComponent className="w-5 h-5 text-white/80" />
                    <span className="text-white/80 text-sm font-medium uppercase tracking-wider">
                      {config.label}
                    </span>
                  </motion.div>
                  <motion.h1
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.4,
                    }}
                    className="text-3xl md:text-4xl font-bold text-white"
                  >
                    {offer.title?.[lang]}
                  </motion.h1>

                  {/* First-order / scope chips */}
                  {(isFirstOrder || vendorName || offer.isGlobal) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {isFirstOrder && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                          <SparklesIcon className="w-3.5 h-3.5" />
                          {t("first_order_offer")}
                        </span>
                      )}
                      {offer.isGlobal ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                          <StoreIcon className="w-3.5 h-3.5" />
                          {t("all_stores")}
                        </span>
                      ) : (
                        vendorName && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                            <StoreIcon className="w-3.5 h-3.5" />
                            {vendorName}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay: 0.5,
                }}
                className="flex flex-col items-end gap-2"
              >
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold ${offer.isActive && !isExpired && !offer.isDeleted ? "bg-white text-green-600" : "bg-white/20 text-white"}`}
                >
                  {offer.isDeleted
                    ? "DELETED"
                    : isExpired
                      ? "EXPIRED"
                      : isUpcoming
                        ? "UPCOMING"
                        : offer.isActive
                          ? "ACTIVE"
                          : "INACTIVE"}
                </span>
                {offer.isAutoApply && (
                  <span className="flex items-center gap-1 text-white/90 text-sm">
                    <ZapIcon className="w-4 h-4" />
                    {t("auto_applied")}
                  </span>
                )}
              </motion.div>
            </div>

            {offer.description && (
              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.6,
                }}
                className="mt-6 text-white/90 text-lg max-w-2xl"
              >
                {offer.description?.[lang]}
              </motion.p>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.7,
          }}
          className="flex justify-end gap-3 mb-6"
        >
          {/* {(role === "ADMIN" || role === "SUPER_ADMIN") && offer.offerType !== "BOGO" && <motion.button
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={() => setOpenEditModal(true)}
            className="bg-indigo-500 hover:bg-indigo-500/90 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-lg"
          >
            <EditIcon className="w-4 h-4" />
            {t("edit")}
          </motion.button>} */}
          {offer.isActive && (
            (role === "ADMIN" || role === "SUPER_ADMIN") && offer.offerType !== "BOGO" && (
              <motion.button
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => setOpenStatusUpdateModal(true)}
                className="bg-yellow-500 hover:bg-yellow-500/90 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-lg"
              >
                <BanIcon className="w-4 h-4" />
                {t("deactivate")}
              </motion.button>
            )
          )}
          {!offer.isActive && (
            (role === "ADMIN" || role === "SUPER_ADMIN") && offer.offerType !== "BOGO" && (
              <motion.button
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => setOpenStatusUpdateModal(true)}
                className="bg-[#DC3173] hover:bg-[#DC3173]/-90 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-lg"
              >
                <ShieldIcon className="w-4 h-4" />
                {t("activate")}
              </motion.button>
            )
          )}
          <motion.button
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={() => setOpenDeleteModal(true)}
            className="bg-red-500 hover:bg-red-500/90 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-lg"
          >
            <TrashIcon className="w-4 h-4" />
            {t("delete_offer")}
          </motion.button>
        </motion.div>

        {/* Code Section */}
        {offer.code && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.8,
            }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{t("promo_code")}</p>
                <p className="text-2xl font-mono font-bold text-slate-800 tracking-widest">
                  {offer.code}
                </p>
              </div>
              <motion.button
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                onClick={copyCode}
                className={`p-3 rounded-xl transition-all ${copied ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {copied ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <CopyIcon className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              icon: ShoppingBagIcon,
              label: t("min_order"),
              value: offer.minOrderAmount ? `€${offer.minOrderAmount}` : 0,
            },
            {
              icon: TargetIcon,
              label: t("max_discount"),
              value: offer.maxDiscountAmount
                ? `€${offer.maxDiscountAmount}`
                : offer.offerType !== "PERCENT"
                  ? "N/A"
                  : 0,
            },
            {
              icon: UsersIcon,
              label: t("limit_user"),
              value: offer.userUsageLimit || t("unlimited"),
            },
            {
              icon: TrendingUpIcon,
              label: t("total_uses"),
              value: `${offer.usageCount || 0}${offer.maxUsageCount ? `/${offer.maxUsageCount}` : ""}`,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.9 + index * 0.1,
              }}
              className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100"
            >
              <stat.icon className="w-5 h-5 text-[#DC3173] mb-3" />
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-slate-800">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* First-order rules */}
        {isFirstOrder && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1.2,
            }}
            className="bg-linear-to-br from-pink-50 to-rose-50 rounded-2xl p-6 mb-6 border border-pink-100"
          >
            <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-[#DC3173]" />
              {t("first_order_offer")}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              {t("first_order_description_prefix")}{" "}
              {eligibilityScope === "VENDOR"
                ? t("first_order_scope_vendor")
                : t("first_order_scope_platform")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoTile
                icon={StoreIcon}
                label={t("scope")}
                value={eligibilityScope === "VENDOR" ? t("single_store") : t("whole_platform")}
              />
              <InfoTile
                icon={PhoneIcon}
                label={t("verified_phone")}
                value={
                  (offer.eligibility?.requireVerifiedPhone ?? true)
                    ? t("required")
                    : t("not_required")
                }
              />
              <InfoTile
                icon={RotateCcwIcon}
                label={t("given_back_up_to")}
                value={`${offer.eligibility?.maxRestores ?? 2} time${(offer.eligibility?.maxRestores ?? 2) === 1 ? "" : "s"}`}
              />
            </div>
          </motion.div>
        )}

        {/* Offer rules (store, funding, scope) */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 1.25,
          }}
          className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <LayersIcon className="w-5 h-5 text-[#DC3173]" />
            {t("offer_rules")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoTile
              icon={StoreIcon}
              label="Store"
              value={
                offer.isGlobal
                  ? t("platform_wide")
                  : vendorName
                    ? `${vendorName}${offer.vendorId?.userId ? ` (${offer.vendorId.userId})` : ""}`
                    : "-"
              }
            />
            {offer.createdByRole && (
              <InfoTile
                icon={UserCheckIcon}
                label={t("created_by")}
                value={roleLabel[offer.createdByRole] ?? offer.createdByRole}
              />
            )}
            {offer.fundedBy && (
              <InfoTile
                icon={WalletIcon}
                label={t("funded_by")}
                value={fundedByLabel[offer.fundedBy] ?? offer.fundedBy}
              />
            )}
            {typeof offer.vendorSharePercent === "number" && (
              <InfoTile
                icon={WalletIcon}
                label={t("vendor_share")}
                value={`${offer.vendorSharePercent}%`}
              />
            )}
            {isDiscountOffer && (
              <InfoTile
                icon={TagIcon}
                label={t("applicable_products")}
                value={
                  offer.scopeType === "SPECIFIC_PRODUCTS"
                    ? `${specificProducts.length} ${t("selected")}`
                    : t("all_products")
                }
              />
            )}
            {isDiscountOffer && (
              <InfoTile
                icon={PercentIcon}
                label={t("already_discounted_products")}
                value={offer.allowDiscountedProducts ? t("included") : t("excluded")}
              />
            )}
            <InfoTile
              icon={ZapIcon}
              label={t("applied")}
              value={offer.isAutoApply ? t("automatically") : t("with_promo_code")}
            />
            <InfoTile
              icon={UsersIcon}
              label={t("customers_who_used_it")}
              value={customersUsed}
            />
            <InfoTile
              icon={CalendarIcon}
              label={t("created")}
              value={formatDate(offer.createdAt)}
            />
            <InfoTile
              icon={ClockIcon}
              label={t("last_updated")}
              value={formatDate(offer.updatedAt)}
            />
          </div>

          {isDiscountOffer &&
            offer.scopeType === "SPECIFIC_PRODUCTS" &&
            specificProductNames.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {specificProductNames.map((name, i) => (
                  <span
                    key={`${name}-${i}`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

          {/* {isDiscountOffer &&
            offer.scopeType === "SPECIFIC_PRODUCTS" &&
            specificProductNames.length === 0 &&
            specificProductIds.length > 0 && (
              <details className="mt-4 text-sm text-slate-600">
                <summary className="cursor-pointer text-[#DC3173]">
                  View product IDs ({specificProductIds.length})
                </summary>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {specificProductIds.map((id) => (
                    <li
                      key={id}
                      className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700"
                    >
                      {id}
                    </li>
                  ))}
                </ul>
              </details>
            )} */}
        </motion.div>

        {/* Usage Progress */}
        {offer.maxUsageCount && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1.3,
            }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">{t("usage_progress")}</h3>
              <span className="text-sm text-slate-500">
                {offer.usageCount || 0} {t("of")} {offer.maxUsageCount} {t("used")}
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${usagePercentage}%`,
                }}
                transition={{
                  duration: 1,
                  delay: 1.5,
                }}
                className={`h-full bg-[#DC3173] rounded-full`}
              />
            </div>
          </motion.div>
        )}

        {/* Validity Timeline */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 1.4,
          }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
        >
          <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#DC3173]" />
            {t("validity_period")}
          </h3>

          <div className="relative">
            <div className="flex justify-between text-sm mb-3">
              <div>
                <p className="text-slate-500">{t("start_date")}</p>
                <p className="font-semibold text-slate-800">
                  {start.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">{t("end_date")}</p>
                <p className="font-semibold text-slate-800">
                  {end.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${timeProgress}%`,
                }}
                transition={{
                  duration: 1,
                  delay: 1.6,
                }}
                className={`h-full rounded-full ${isExpired ? "bg-slate-400" : isUpcoming ? "bg-blue-400" : "bg-linear-to-r from-[#DC3173] to-[#E85A8F]"}`}
              />
            </div>

            <div className="flex items-center justify-center mt-4">
              <ClockIcon className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-sm text-slate-500">
                {isExpired
                  ? t("this_offer_has_expired")
                  : isUpcoming
                    ? `${t("starts_in")} ${Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} ${t("days")}`
                    : `${Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} ${t("days_remaining")}`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* BOGO Details */}
        {offer.offerType === "BOGO" && offer.bogo && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1.5,
            }}
            className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mt-6 border border-purple-100"
          >
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <GiftIcon className="w-5 h-5 text-purple-600" />
              {t("bogo_details")}
            </h3>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl p-4 flex-1 text-center shadow-sm">
                <p className="text-3xl font-bold text-purple-600">
                  {offer.bogo.buyQty}
                </p>
                <p className="text-sm text-slate-500">{t("buy")}</p>
              </div>
              <SparklesIcon className="w-6 h-6 text-purple-400" />
              <div className="bg-white rounded-xl p-4 flex-1 text-center shadow-sm">
                <p className="text-3xl font-bold text-pink-600">
                  {offer.bogo.getQty}
                </p>
                <p className="text-sm text-slate-500">{t("get_free")}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-4 text-center">
              {t("item_id")}: <span className="font-mono">{offer.bogo.productId}</span>
            </p>
          </motion.div>
        )}

        {/* Buy & Reward Details */}
        {offer.offerType === "BUY_AND_REWARD" && offer.buyAndReward && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1.5,
            }}
            className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mt-6 border border-purple-100"
          >
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <GiftIcon className="w-5 h-5 text-purple-600" />
              {t("buy_and_reward_details")}
            </h3>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl p-4 flex-1 text-center shadow-sm">
                <p className="text-3xl font-bold text-purple-600">
                  {offer.buyAndReward.buy.quantity}
                </p>
                <p className="text-sm text-slate-500">
                  {t("buy")} ({offer.buyAndReward.buy.productIds?.length ?? 0} {t("product")}
                  {(offer.buyAndReward.buy.productIds?.length ?? 0) === 1 ? "" : "s"})
                </p>
              </div>
              <SparklesIcon className="w-6 h-6 text-purple-400" />
              <div className="bg-white rounded-xl p-4 flex-1 text-center shadow-sm">
                <p className="text-3xl font-bold text-pink-600">
                  {offer.buyAndReward.reward.quantity}
                </p>
                <p className="text-sm text-slate-500">
                  {t("get_free")} (
                  {rewardTypeLabel[offer.buyAndReward.reward.type] ??
                    offer.buyAndReward.reward.type}
                  )
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoTile
                icon={LayersIcon}
                label={t("addons_in_reward")}
                value={
                  offer.buyAndReward.reward.includeAddons
                    ? t("included")
                    : t("not_included")
                }
              />
              {offer.buyAndReward.reward.variationSku && (
                <InfoTile
                  icon={TagIcon}
                  label={t("reward_sku")}
                  value={offer.buyAndReward.reward.variationSku}
                />
              )}
            </div>

            <IdList title={t("products_to_buy")} ids={buyProductIds} />
            {rewardProductId && (
              <IdList title={t("reward_product")} ids={[rewardProductId]} />
            )}
            <IdList title={t("reward_options")} ids={rewardOptionIds} />
          </motion.div>
        )}
      </motion.div>

      {/* Edit Modal */}
      {/* <EditOfferModal
        open={openEditModal}
        onOpenChange={(open) => setOpenEditModal(open)}
        prevValues={offer}
      /> */}

      {/* Status Update Modal */}
      <OfferStatusUpdateModal
        open={openStatusUpdateModal}
        onOpenChange={closeStatusUpdateModal}
        onConfirm={handleUpdateStatus}
        statusInfo={{
          offerId: offer._id,
          offerName: offer.title?.[lang] as string,
          status: !offer.isActive,
        }}
        buttonDisabled={buttonDisabled}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={openDeleteModal}
        onOpenChange={closeDeleteModal}
        onConfirm={handleDeleteCampaign}
        isDeleting={isDeleting}
      />
    </div>
  );
}