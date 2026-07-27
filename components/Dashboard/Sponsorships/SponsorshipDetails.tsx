"use client";

import DeleteModal from "@/components/Modals/DeleteModal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { deleteSponsorshipReq } from "@/services/dashboard/sponsorship/sponsorship.service";
import { TSponsorship } from "@/types/sponsorship.type";
import { motion } from "framer-motion";
import Image from "next/image"; // Import Next.js Image component
import {
  ArrowLeftCircle,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ImageIcon,
  MegaphoneIcon,
  SparklesIcon,
  TagIcon,
  TrashIcon,
  XCircleIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  sponsorship: TSponsorship;
}

const sponsorTypeConfig = {
  Ads: {
    icon: MegaphoneIcon,
    color: "bg-violet-500",
    lightBg: "bg-violet-100",
    text: "text-violet-700",
  },
  Offer: {
    icon: TagIcon,
    color: "bg-rose-500",
    lightBg: "bg-rose-100",
    text: "text-rose-700",
  },
  Other: {
    icon: SparklesIcon,
    color: "bg-slate-500",
    lightBg: "bg-slate-100",
    text: "text-slate-700",
  },
};

export function SponsorshipDetails({ sponsorship }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const config = sponsorTypeConfig[sponsorship.sponsorType];
  const IconComponent = config.icon;

  const now = new Date();
  const start = new Date(sponsorship.startDate);
  const end = new Date(sponsorship.endDate);
  const isExpired = now > end;
  const isUpcoming = now < start;
  const isLive = !isExpired && !isUpcoming;
  const totalDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysElapsed = Math.ceil(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysRemaining = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setDeleteId("");
    }
  };

  const deleteSponsorship = async () => {
    const toastId = toast.loading("Deleting Sponsorship...");
    setIsDeleting(true);

    const result = await deleteSponsorshipReq(deleteId);

    if (result.success) {
      toast.success(result.message || "Sponsorship deleted successfully!", {
        id: toastId,
      });
      router.refresh();
      closeDeleteModal(false);
      return;
    }

    toast.error(result.message || "Sponsorship delete failed", { id: toastId });
    console.log(result);
    setIsDeleting(false);
  };

  // Adjust URL
  const targetUrl = sponsorship.url || "#";

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
      >
        <div className="mb-4">
          <Button
            onClick={() => router.back()}
            variant="link"
            className="inline-flex items-center text-sm gap-2 text-[#DC3173] px-0! py-0 h-4 cursor-pointer"
          >
            <ArrowLeftCircle /> {t("go_back")}
          </Button>
        </div>

        {/* Banner Hero */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative rounded-3xl overflow-hidden shadow-2xl mb-8"
        >
          {/* Banner Image Container */}
          <div className="relative aspect-21/9 bg-slate-100">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <ImageIcon className="w-16 h-16 text-slate-300 animate-pulse" />
              </div>
            )}

            {/* Anchor tag to handle new tab navigation */}
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full relative cursor-pointer group"
            >
              <Image
                src={sponsorship.bannerImage}
                alt={sponsorship.sponsorName}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className={`object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                  }`}
                onLoad={() => setImageLoaded(true)}
              />
            </a>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/50 to-transparent pointer-events-none" />

            {/* Status Badge */}
            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.3,
              }}
              className="absolute top-6 right-6 z-10"
            >
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${isLive && sponsorship.isActive
                  ? "bg-green-500 text-white"
                  : isExpired
                    ? "bg-slate-600 text-slate-300"
                    : isUpcoming
                      ? "bg-blue-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
              >
                {isLive && sponsorship.isActive ? (
                  <>
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </>
                ) : isExpired ? (
                  "ENDED"
                ) : isUpcoming ? (
                  "SCHEDULED"
                ) : (
                  "INACTIVE"
                )}
              </span>
            </motion.div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-none z-10">
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
                  delay: 0.4,
                }}
                className="flex items-end justify-between"
              >
                <div>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.lightBg} ${config.text} mb-4`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {sponsorship.sponsorType}
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {sponsorship.sponsorName}
                  </h1>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Delete Button */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.5,
          }}
          className="flex justify-end mb-8"
        >
          <motion.button
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={() => setDeleteId(sponsorship?._id)}
            className="bg-red-500 hover:bg-red-500/90 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            {t("delete")}
          </motion.button>
        </motion.div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Status Card */}
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
              delay: 0.6,
            }}
            className="rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 text-sm font-medium uppercase tracking-wider">
                {t("status")}
              </h3>
              {sponsorship.isActive ? (
                <CheckCircleIcon className="w-5 h-5 text-[#DC3173]" />
              ) : (
                <XCircleIcon className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-2xl font-bold">
              {sponsorship.isActive ? "Active" : "Inactive"}
            </p>
            <p className="text-slate-700 text-sm mt-1">
              {isLive
                ? t("currently_running")
                : isExpired
                  ? t("campaign_ended")
                  : t("scheduled_to_start")}
            </p>
          </motion.div>

          {/* Duration Card */}
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
              delay: 0.7,
            }}
            className="rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 text-sm font-medium uppercase tracking-wider">
                {t("duration")}
              </h3>
              <ClockIcon className="w-5 h-5 text-[#DC3173]" />
            </div>
            <p className="text-2xl font-bold">{totalDays} {t("days")}</p>
            <p className="text-slate-700 text-sm mt-1">
              {isExpired
                ? t("campaign_completed")
                : isUpcoming
                  ? `${t("starts_in")} ${Math.abs(daysElapsed)} ${t("days_sm")}`
                  : `${daysRemaining} ${t("days_remaining")}`}
            </p>
          </motion.div>

          {/* Type Card */}
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
            className="rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 text-sm font-medium uppercase tracking-wider">
                {t("type")}
              </h3>
              <IconComponent className={`w-5 h-5 ${config.text}`} />
            </div>
            <p className="text-2xl font-bold">{sponsorship.sponsorType}</p>
            <p className="text-slate-700 text-sm mt-1">{t("sponsorship_category")}</p>
          </motion.div>
        </div>

        {/* Timeline Section */}
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
            delay: 0.9,
          }}
          className="shadow-lg rounded-2xl p-8 mb-8"
        >
          <h3 className="text-white font-semibold mb-8 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#DC3173]" />
            {t("campaign_timeline")}
          </h3>

          <div className="relative">
            {/* Timeline Track */}
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: isExpired
                    ? "100%"
                    : isUpcoming
                      ? "0%"
                      : `${Math.min((daysElapsed / totalDays) * 100, 100)}%`,
                }}
                transition={{
                  duration: 1,
                  delay: 1.1,
                }}
                className="h-full bg-linear-to-r from-[#DC3173] to-[#E85A8F] rounded-full"
              />
            </div>

            {/* Timeline Markers */}
            <div className="flex justify-between mt-6">
              <div className="text-left">
                <div className="w-4 h-4 rounded-full bg-[#DC3173] mb-3 shadow-lg shadow-[#DC3173]/50" />
                <p className="text-slate-800 text-xs uppercase tracking-wider mb-1">
                  {t("start")}
                </p>
                <p className="font-semibold">
                  {start.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {isLive && (
                <div className="text-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="w-4 h-4 rounded-full bg-green-500 mb-3 mx-auto shadow-lg shadow-green-500/50"
                  />
                  <p className="text-slate-800 text-xs uppercase tracking-wider mb-1">
                    {t("now")}
                  </p>
                  <p className="text-green-400 font-semibold">{t("live")}</p>
                </div>
              )}

              <div className="text-right">
                <div
                  className={`w-4 h-4 rounded-full mb-3 ml-auto ${isExpired ? "bg-slate-800" : "bg-slate-600"}`}
                />
                <p className="text-slate-800 text-xs uppercase tracking-wider mb-1">
                  {t("end")}
                </p>
                <p className="font-semibold">
                  {end.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metadata Footer */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 1,
          }}
          className="flex flex-wrap gap-6 text-sm text-slate-700"
        >
          <div>
            <span className="text-slate-900">{t("created")}:</span>{" "}
            {new Date(sponsorship.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div>
            <span className="text-slate-900">{t("last_updated")}:</span>{" "}
            {new Date(sponsorship.updatedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteId}
        onOpenChange={closeDeleteModal}
        onConfirm={deleteSponsorship}
        isDeleting={isDeleting}
      />
    </div>
  );
}