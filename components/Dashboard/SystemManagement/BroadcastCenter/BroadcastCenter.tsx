"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Button } from "@/components/ui/button";
import { USER_ROLE } from "@/consts/user.const";
import { getAllUsersReq } from "@/services/dashboard/system-management/email-notification-settings.service";
import { TMeta } from "@/types";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  BellIcon,
  BikeIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  LoaderCircleIcon,
  MailIcon,
  SearchIcon,
  SendIcon,
  ShieldIcon,
  StoreIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import CommunicationType from "./CommunicationType";
import MessageForm from "./MessageForm";
import NotificationDropdown from "./NotificationDropdown";
import { TNotificationType } from "@/types/notification.type";
import PreviewCard from "./PreviewCard";
import RoleSelector from "./RoleSelector";

export type TUser = {
  _id: string;
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

const ROLES = [
  {
    id: "VENDOR",
    label: "Vendors",
    icon: StoreIcon,
    count: 47,
    color: "blue",
  },
  {
    id: "FLEET_MANAGER",
    label: "Fleet Managers",
    icon: UsersIcon,
    count: 8,
    color: "purple",
  },
  {
    id: "CUSTOMER",
    label: "Customers",
    icon: UserIcon,
    count: 1240,
    color: "emerald",
  },
  {
    id: "DELIVERY_PARTNER",
    label: "Delivery Partners",
    icon: BikeIcon,
    count: 32,
    color: "amber",
  },
  {
    id: "ADMIN",
    label: "Admins",
    icon: ShieldIcon,
    count: 5,
    color: "red",
  },
] as const;

const Avatar = ({ name, colorClass }: { name: string; colorClass: string }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colorClass}`}
    >
      {initials}
    </div>
  );
};

export default function BroadcastCenter() {
  const [notificationCategory, setNotificationCategory] = useState<TNotificationType>();
  const [commType, setCommType] = useState<"email" | "push" | "both">("email");

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

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
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

  const handleSend = () => {
    if (selectedRoles.length === 0)
      return toast.error("Please select at least one role.");
    if (commType !== "email" && !title.trim())
      return toast.error("Please enter a title.");
    if (!message.trim()) return toast.error("Please enter a message.");

    setTimeout(() => {
      setTitle("");
      setMessage("");
      setSelectedRoles([]);
      setShowPreview(false);
    }, 3000);
  };


  return (
    <div className="min-h-screen p-6">
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
              itemVariants={itemVariants}
            />

            {/* Message Composition */}
            <MessageForm
              title={title}
              setTitle={setTitle}
              message={message}
              setMessage={setMessage}
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
              message={message}
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
