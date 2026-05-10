/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [notificationCategory, setNotificationCategory] = useState<TNotificationType>();
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

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);

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
    if (commType !== "EMAIL" && !title.trim())
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
      } else {
        finalTargetAudience.push(role);
      }
    });

    const toastId = toast.loading("Sending...");

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

    try {
      const res = await broadcastNotificationReq(payload);
      toast.success(res?.message, { id: toastId })
    } catch (error: any) {
      toast.error(error?.message || "Notification sent failed", { id: toastId })
    }

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
      setNotificationCategory(undefined as unknown as TNotificationType);
    }, 2000);
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
          title="Email & Notification Settings"
          subtitle="Send announcements, alerts, or promotional messages to specific user groups across the platform."
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
              defaultValue={notificationCategory}
              itemVariants={itemVariants}
            />
            {/* Actions Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-6"
            >
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Actions
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors border-2 ${showPreview ? "bg-gray-100 border-gray-100 text-gray-900" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  <EyeIcon className="w-4 h-4" />
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>

                <button
                  onClick={handleSend}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-[#DC3173] text-white hover:bg-[#c42a65] transition-colors shadow-sm shadow-[#DC3173]/20"
                >
                  <SendIcon className="w-4 h-4" />
                  Send Broadcast
                </button>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                  Best Practices
                </h4>
                <ul className="text-xs text-amber-700 space-y-2 list-disc pl-4">
                  <li>Keep subjects short & clear.</li>
                  <li>Always check preview before broadcasting.</li>
                  <li>Do not spam users frequently.</li>
                  <li>
                    Use personalization tags like {"{name}"} if supported.
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
