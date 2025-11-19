"use client";

import { ProfileInfoRow } from "@/components/Profile/ProfileInfoRow";
import ProfilePhotoUpload from "@/components/Profile/ProfilePhotoUpload";
import { ProfileSection } from "@/components/Profile/ProfileSection";
import { USER_STATUS } from "@/consts/user.const";
import { TAdmin } from "@/types/admin.type";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";

export default function Profile({ admin }: { admin: TAdmin }) {
  const getStatusColor = (status: keyof typeof USER_STATUS) => {
    const colors = {
      APPROVED: "bg-green-100 text-green-700 border-green-200",
      SUBMITTED: "bg-gray-100 text-gray-700 border-gray-200",
      REJECTED: "bg-red-100 text-red-700 border-red-200",
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header with gradient */}
      <div className="relative bg-linear-to-r from-[#DC3173] to-[#FF6B9D] h-48 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="px-4 md:px-6 -mt-20 pb-12">
        {/* Profile Header Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-8 mb-8 relative"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            <ProfilePhotoUpload currentPhoto={admin?.profilePhoto} />

            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {admin?.name}
                </h1>
                <motion.span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    admin?.status
                  )}`}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  {admin?.status}
                </motion.span>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MailIcon className="w-4 h-4" />
                  <span>{admin?.email}</span>
                </div>
                {admin?.isEmailVerified && (
                  <div className="flex items-center gap-1 text-[#DC3173]">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <ProfileSection
            title="Personal Information"
            icon={UserIcon}
            delay={0.1}
          >
            <div className="space-y-1">
              <ProfileInfoRow
                label="Phone Number"
                value={admin?.contactNumber}
                icon={PhoneIcon}
              />
              <ProfileInfoRow
                label="Email"
                value={admin?.email}
                icon={MailIcon}
              />
            </div>
          </ProfileSection>

          {/* Activity */}
          <ProfileSection
            title="Account Activity"
            icon={ClockIcon}
            delay={0.35}
          >
            <div className="space-y-1">
              <ProfileInfoRow
                label="Account Created"
                value={new Date(
                  admin?.createdAt as string
                ).toLocaleDateString()}
                icon={CalendarIcon}
              />
              <ProfileInfoRow
                label="Two-Factor Auth"
                value={admin?.twoFactorEnabled ? "Enabled" : "Disabled"}
                icon={ShieldCheckIcon}
              />
            </div>
          </ProfileSection>
        </div>
      </div>
    </div>
  );
}
