"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { USER_ROLE } from "@/consts/user.const";
import { motion, Variants } from "framer-motion";
import { EyeIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import CommunicationType from "./CommunicationType";
import MessageForm from "./MessageForm";
import NotificationDropdown from "./NotificationDropdown";
import { TNotificationType } from "@/types/notification.type";
import PreviewCard from "./PreviewCard";
import RoleSelector from "./RoleSelector";
import { broadcastNotificationReq } from "@/services/dashboard/notifications/notifications.service";
import { useTranslation } from "@/hooks/use-translation";

export type TUser = {
  _id: string;
  userId: string;
  name: {
    firstName: string;
    lastName: string;
  };
  email: string;
  contactNumber: string;
};

type RoleType = keyof Pick<
  typeof USER_ROLE,
  "ADMIN" | "CUSTOMER" | "FLEET_MANAGER" | "VENDOR" | "DELIVERY_PARTNER"
>;

export default function BroadcastCenter() {
  const { t } = useTranslation();
  const [notificationCategory, setNotificationCategory] = useState<TNotificationType | undefined>();
  const [commType, setCommType] = useState<"PUSH" | "BOTH" | "EMAIL">("EMAIL");

  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<
    Record<RoleType, Set<string>>
  >({
    VENDOR: new Set(),
    CUSTOMER: new Set(),
    DELIVERY_PARTNER: new Set(),
    FLEET_MANAGER: new Set(),
    ADMIN: new Set(),
  });
  const [expandedPanels, setExpandedPanels] = useState<
    Record<RoleType, boolean>
  >({
    VENDOR: true,
    CUSTOMER: true,
    DELIVERY_PARTNER: true,
    FLEET_MANAGER: true,
    ADMIN: true,
  });

  const [searchQueries, setSearchQueries] = useState<Record<RoleType, string>>({
    VENDOR: '',
    CUSTOMER: '',
    DELIVERY_PARTNER: '',
    FLEET_MANAGER: '',
    ADMIN: '',
  });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  } as Variants;

  const handleSend = async () => {
    if (selectedRoles.length === 0)
      return toast.error("Please select at least one role.");
    if (!title.trim())
      return toast.error("Please enter a title.");
    if (!body.trim()) return toast.error("Please enter a message.");
    if (!notificationCategory)
      return toast.error("Please select a category of notification");


    const finalCustomUserIds: string[] = [];
    const finalTargetAudience: RoleType[] = [];

    selectedRoles.forEach((role) => {
      const userSet = selectedUsers[role];

      if (userSet && userSet.size > 0) {
        finalCustomUserIds.push(...Array.from(userSet));
        finalTargetAudience.push(role);
      } else {
        finalTargetAudience.push(role);
      }
    });

    const toastId = toast.loading("Sending...");
    setIsSubmitting(true);

    const payload = {
      communicationType: commType,
      targetAudience: finalTargetAudience,
      customUserIds: finalCustomUserIds,
      title,
      body: body,
      type: notificationCategory,
      data: {
        click_action: "",
        screen: "",
        promoId: "",
        discount: "",
        sound: "default",
        channelId: "default"
      }
    };

    const res = await broadcastNotificationReq(payload);

    if (res.success) {
      toast.success(res?.message, { id: toastId })
      setIsSubmitting(false);
      setTimeout(() => {
        setTitle("");
        setBody("");
        setSelectedRoles([]);
        setShowPreview(false);
        setSelectedUsers({
          VENDOR: new Set(),
          CUSTOMER: new Set(),
          DELIVERY_PARTNER: new Set(),
          FLEET_MANAGER: new Set(),
          ADMIN: new Set(),
        });
        setExpandedPanels({
          VENDOR: false,
          CUSTOMER: false,
          DELIVERY_PARTNER: false,
          FLEET_MANAGER: false,
          ADMIN: false,
        });
        setSearchQueries({
          VENDOR: "",
          CUSTOMER: "",
          DELIVERY_PARTNER: "",
          FLEET_MANAGER: "",
          ADMIN: "",
        });
        setNotificationCategory(undefined);
      }, 1000);
      return;
    };


    if (res?.data?.errorSources) {
      res?.data?.errorSources?.map((err: { path: string, message: string }) => (
        toast.error(err?.message, { id: toastId })
      ));
      return;
    } else {
      toast.error(res?.message || "Notification sent failed", { id: toastId })
      setIsSubmitting(false);
    }
    console.log(res);
    return;
  };

  return (
    <div className="min-h-screen">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <TitleHeader
          title={t("email_and_notification_settings")}
          subtitle={t("send_announcements_alerts_promotional_emails")}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">

            {/* Communication Type */}
            <CommunicationType
              commType={commType}
              setCommType={setCommType}
              itemVariants={itemVariants}
            />

            {/* Role Selection */}
            <RoleSelector
              selectedRoles={selectedRoles}
              setSelectedRoles={setSelectedRoles}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              expandedPanels={expandedPanels}
              setExpandedPanels={setExpandedPanels}
              searchQueries={searchQueries}
              setSearchQueries={setSearchQueries}
              itemVariants={itemVariants}
            />

            {/* Message Composition */}
            <MessageForm
              title={title}
              setTitle={setTitle}
              body={body}
              setBody={setBody}
              itemVariants={itemVariants}
            />
          </div>

          {/* Right Column: Preview & Actions */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">

            <NotificationDropdown
              onValueChange={setNotificationCategory}
              value={notificationCategory}
              itemVariants={itemVariants}
            />
            {/* Actions Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-6"
            >
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                {t("actions")}
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors border-2 ${showPreview ? "bg-gray-100 border-gray-100 text-gray-900" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  <EyeIcon className="w-4 h-4" />
                  {showPreview ? t("hide_preview") : t("show_preview")}
                </button>

                <button
                  onClick={handleSend}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-[#DC3173] text-white hover:bg-[#c42a65] transition-colors shadow-sm shadow-[#DC3173]/20"
                >
                  <SendIcon className="w-4 h-4" />
                  {t("send_broadcast")}
                </button>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                  {t("best_practices")}
                </h4>
                <ul className="text-xs text-amber-700 space-y-2 list-disc pl-4">
                  <li>{t("keep_subjects_short_and_clear")}</li>
                  <li>{t("always_check_preview_before_broadcasting")}</li>
                  <li>{t("do_not_spam_users_frequently")}</li>
                  <li>
                    {t("use_personalization_tags")} {"{name}"} {t("if_supported")}
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Inline Preview Card */}
            <PreviewCard
              title={title}
              commType={commType}
              message={body}
              showPreview={showPreview}
            />
          </div>
        </div>
      </motion.div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 20px;
        }
      `,
        }}
      />
    </div>
  );
}
