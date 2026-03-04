"use client";

import EditOfferModal from "@/components/Dashboard/Offers/ActiveCampaigns/EditOfferModal";
import OfferStatusUpdateModal from "@/components/Dashboard/Offers/ActiveCampaigns/OfferStatusUpdateModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import {
  deleteOfferReq,
  updateOfferReq,
} from "@/services/dashboard/offers/offers";
import { TOffer } from "@/types/offer.type";
import { motion } from "framer-motion";
import {
  BanIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  EditIcon,
  GiftIcon,
  PercentIcon,
  ShieldIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TagIcon,
  TargetIcon,
  TrashIcon,
  TrendingUpIcon,
  TruckIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  offer: TOffer;
}

const offerTypeConfig = {
  PERCENT: {
    icon: PercentIcon,
    label: "Percentage Off",
    textColor: "text-amber-700",
  },
  FLAT: {
    icon: TagIcon,
    label: "Flat Discount",
    textColor: "text-emerald-700",
  },
  FREE_DELIVERY: {
    icon: TruckIcon,
    label: "Free Delivery",
    textColor: "text-blue-700",
  },
  BOGO: {
    icon: GiftIcon,
    label: "Buy One Get One",
    textColor: "text-purple-700",
  },
};

export default function OfferDetails({ offer }: IProps) {
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openStatusUpdateModal, setOpenStatusUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const config = offerTypeConfig[offer.offerType];
  const IconComponent = config.icon;

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
      case "FREE_DELIVERY":
        return "FREE";
      case "BOGO":
        return `${offer.bogo?.buyQty}+${offer.bogo?.getQty}`;
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

  const closeStatusUpdateModal = (open: boolean) => {
    setOpenStatusUpdateModal(open);
  };

  const handleUpdateStatus = async () => {
    const toastId = toast.loading("Updating offer...");

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

    toast.error(result.message || "Offer update failed", { id: toastId });
    console.log(result);
  };

  const closeDeleteModal = (open: boolean) => {
    setOpenDeleteModal(open);
  };

  const handleDeleteCampaign = async () => {
    const toastId = toast.loading("Deleting Offer...");

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
    console.log(result);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
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
                    {offer.title}
                  </motion.h1>
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
                  className={`px-4 py-2 rounded-full text-sm font-bold ${offer.isActive && !isExpired ? "bg-white text-green-600" : "bg-white/20 text-white"}`}
                >
                  {isExpired
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
                    Auto-Applied
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
                {offer.description}
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
          <motion.button
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
            Edit
          </motion.button>
          {offer.isActive && (
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
              Deactive
            </motion.button>
          )}
          {!offer.isActive && (
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
              Activate
            </motion.button>
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
            Delete Offer
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
                <p className="text-sm text-slate-500 mb-1">Promo Code</p>
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
              label: "Min Order",
              value: offer.minOrderAmount ? `€${offer.minOrderAmount}` : 0,
            },
            {
              icon: TargetIcon,
              label: "Max Discount",
              value: offer.maxDiscountAmount
                ? `€${offer.maxDiscountAmount}`
                : 0,
            },
            {
              icon: UsersIcon,
              label: "Limit/User",
              value: offer.userUsageLimit || "Unlimited",
            },
            {
              icon: TrendingUpIcon,
              label: "Total Uses",
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
              <h3 className="font-semibold text-slate-800">Usage Progress</h3>
              <span className="text-sm text-slate-500">
                {offer.usageCount || 0} of {offer.maxUsageCount} used
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
            Validity Period
          </h3>

          <div className="relative">
            <div className="flex justify-between text-sm mb-3">
              <div>
                <p className="text-slate-500">Start Date</p>
                <p className="font-semibold text-slate-800">
                  {start.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">End Date</p>
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
                  ? "This offer has expired"
                  : isUpcoming
                    ? `Starts in ${Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`
                    : `${Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days remaining`}
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
              BOGO Details
            </h3>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl p-4 flex-1 text-center shadow-sm">
                <p className="text-3xl font-bold text-purple-600">
                  {offer.bogo.buyQty}
                </p>
                <p className="text-sm text-slate-500">Buy</p>
              </div>
              <SparklesIcon className="w-6 h-6 text-purple-400" />
              <div className="bg-white rounded-xl p-4 flex-1 text-center shadow-sm">
                <p className="text-3xl font-bold text-pink-600">
                  {offer.bogo.getQty}
                </p>
                <p className="text-sm text-slate-500">Get Free</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-4 text-center">
              Item ID: <span className="font-mono">{offer.bogo.productId}</span>
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <EditOfferModal
        open={openEditModal}
        onOpenChange={(open) => setOpenEditModal(open)}
        prevValues={offer}
      />

      {/* Status Update Modal */}
      <OfferStatusUpdateModal
        open={openStatusUpdateModal}
        onOpenChange={closeStatusUpdateModal}
        onConfirm={handleUpdateStatus}
        statusInfo={{
          offerId: offer._id,
          offerName: offer.title,
          status: !offer.isActive,
        }}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={openDeleteModal}
        onOpenChange={closeDeleteModal}
        onConfirm={handleDeleteCampaign}
      />
    </div>
  );
}
