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

type TUser = {
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
  const [commType, setCommType] = useState<"email" | "push" | "both">("email");
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>([]);
  const [targetModes, setTargetModes] = useState<
    Record<RoleType, "all" | "specific">
  >({
    VENDOR: "all",
    CUSTOMER: "all",
    DELIVERY_PARTNER: "all",
    FLEET_MANAGER: "all",
    ADMIN: "all",
  });
  const [usersData, setUsersData] = useState<
    Record<RoleType, { data: TUser[]; meta?: TMeta }>
  >({
    VENDOR: { data: [] },
    CUSTOMER: { data: [] },
    DELIVERY_PARTNER: { data: [] },
    FLEET_MANAGER: { data: [] },
    ADMIN: { data: [] },
  });
  const [selectedUsers, setSelectedUsers] = useState<
    Record<RoleType, Set<string>>
  >({
    VENDOR: new Set(),
    CUSTOMER: new Set(),
    DELIVERY_PARTNER: new Set(),
    FLEET_MANAGER: new Set(),
    ADMIN: new Set(),
  });
  const [searchQueries, setSearchQueries] = useState<Record<RoleType, string>>({
    VENDOR: "",
    CUSTOMER: "",
    DELIVERY_PARTNER: "",
    FLEET_MANAGER: "",
    ADMIN: "",
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

  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [userDataLoading, setUserDataLoading] = useState<
    Record<RoleType, boolean>
  >({
    VENDOR: false,
    CUSTOMER: false,
    DELIVERY_PARTNER: false,
    FLEET_MANAGER: false,
    ADMIN: false,
  });

  const toggleRole = (roleId: RoleType) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId],
    );
  };

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

  const getUsers = async (roleId: RoleType, limit: number = 10) => {
    const resultData = await getAllUsersReq({
      limit,
      role: roleId,
      searchTerm: searchQueries[roleId],
    });

    setUsersData((prev) => ({
      ...prev,
      [roleId]: resultData,
    }));

    setUserDataLoading((prev) => ({ ...prev, [roleId]: false }));
  };

  const handleTargetMode = (roleId: RoleType, mode: "all" | "specific") => {
    setTargetModes((prev) => ({
      ...prev,
      [roleId]: mode,
    }));
    if (mode === "specific") {
      setExpandedPanels((prev) => ({
        ...prev,
        [roleId]: true,
      }));

      setUserDataLoading((prev) => ({ ...prev, [roleId]: true }));
      getUsers(roleId);
    }
  };

  const toggleUser = (roleId: RoleType, userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev[roleId]);
      if (newSet.has(userId)) newSet.delete(userId);
      else newSet.add(userId);
      return {
        ...prev,
        [roleId]: newSet,
      };
    });
  };

  const toggleAllUsers = (roleId: RoleType, filteredUserIds: string[]) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev[roleId]);
      const allSelected = filteredUserIds.every((id) => newSet.has(id));
      if (allSelected) {
        filteredUserIds.forEach((id) => newSet.delete(id));
      } else {
        filteredUserIds.forEach((id) => newSet.add(id));
      }
      return {
        ...prev,
        [roleId]: newSet,
      };
    });
  };

  const handleSend = () => {
    if (selectedRoles.length === 0)
      return toast.error("Please select at least one role.");
    if (commType !== "push" && !subject.trim())
      return toast.error("Please enter a subject.");
    if (commType !== "email" && !title.trim())
      return toast.error("Please enter a title.");
    if (!message.trim()) return toast.error("Please enter a message.");

    setTimeout(() => {
      setSubject("");
      setTitle("");
      setMessage("");
      setSelectedRoles([]);
      setShowPreview(false);
    }, 3000);
  };

  const getColorClasses = (color: string) => {
    const map: Record<
      string,
      {
        border: string;
        bg: string;
        text: string;
        lightBg: string;
        ring: string;
      }
    > = {
      blue: {
        border: "border-blue-500",
        bg: "bg-blue-500",
        text: "text-blue-600",
        lightBg: "bg-blue-50",
        ring: "ring-blue-500",
      },
      purple: {
        border: "border-purple-500",
        bg: "bg-purple-500",
        text: "text-purple-600",
        lightBg: "bg-purple-50",
        ring: "ring-purple-500",
      },
      emerald: {
        border: "border-emerald-500",
        bg: "bg-emerald-500",
        text: "text-emerald-600",
        lightBg: "bg-emerald-50",
        ring: "ring-emerald-500",
      },
      amber: {
        border: "border-amber-500",
        bg: "bg-amber-500",
        text: "text-amber-600",
        lightBg: "bg-amber-50",
        ring: "ring-amber-500",
      },
      red: {
        border: "border-red-500",
        bg: "bg-red-500",
        text: "text-red-600",
        lightBg: "bg-red-50",
        ring: "ring-red-500",
      },
    };
    return map[color] || map.blue;
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
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Communication Type
              </h2>
              <div className="flex p-1 bg-gray-100 rounded-xl">
                {[
                  {
                    id: "email",
                    label: "Email",
                    icon: MailIcon,
                  },
                  {
                    id: "push",
                    label: "Push Notification",
                    icon: BellIcon,
                  },
                  {
                    id: "both",
                    label: "Both",
                    icon: SendIcon,
                  },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() =>
                      setCommType(type.id as "push" | "both" | "email")
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all relative ${commType === type.id ? "text-[#DC3173] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {commType === type.id && (
                      <motion.div
                        layoutId="commTypeBg"
                        className="absolute inset-0 bg-white rounded-lg"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Role Selection */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Target Audience
                </h2>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {selectedRoles.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {ROLES.map((role) => {
                  const isSelected = selectedRoles.includes(role.id);
                  const colors = getColorClasses(role.color);
                  return (
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      className={`relative overflow-hidden flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${isSelected ? `${colors.border} ${colors.lightBg} shadow-sm ring-1 ${colors.ring}` : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                    >
                      {isSelected && (
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bg}`}
                        />
                      )}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? colors.bg : "bg-gray-100"}`}
                      >
                        <role.icon
                          className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-500"}`}
                        />
                      </div>
                      <div>
                        <p
                          className={`font-bold text-sm ${isSelected ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {role.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {role.count.toLocaleString()} users
                        </p>
                      </div>
                      {isSelected && (
                        <div
                          className={`absolute top-2 right-2 w-4 h-4 rounded-full ${colors.bg} flex items-center justify-center`}
                        >
                          <CheckIcon className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Specific User Selection Panels */}
              <AnimatePresence>
                {selectedRoles.length > 0 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                    className="mt-6 space-y-4"
                  >
                    <div className="h-px bg-gray-100 w-full mb-6" />

                    {selectedRoles.map((roleId) => {
                      const roleDef = ROLES.find((r) => r.id === roleId)!;
                      const colors = getColorClasses(roleDef.color);
                      const mode = targetModes[roleId];
                      const users = usersData?.[roleId] || [];
                      const filteredUsers = users;
                      const isExpanded = expandedPanels[roleId];
                      const selectedCount = selectedUsers[roleId].size;
                      return (
                        <motion.div
                          key={roleId}
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.95,
                          }}
                          className={`border rounded-xl overflow-hidden ${mode === "specific" ? colors.border : "border-gray-200"}`}
                        >
                          {/* Panel Header */}
                          <div
                            className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${mode === "specific" ? colors.lightBg : "bg-gray-50"}`}
                          >
                            <div className="flex items-center gap-2">
                              <roleDef.icon
                                className={`w-4 h-4 ${colors.text}`}
                              />
                              <span className="font-bold text-gray-900 text-sm">
                                {roleDef.label}
                              </span>
                              {mode === "specific" && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} text-white font-medium ml-2`}
                                >
                                  {selectedCount} selected
                                </span>
                              )}
                            </div>

                            <div className="flex bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm">
                              <button
                                onClick={() => handleTargetMode(roleId, "all")}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === "all" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                              >
                                All Users
                              </button>
                              <button
                                onClick={() =>
                                  handleTargetMode(roleId, "specific")
                                }
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === "specific" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                              >
                                Select Specific
                              </button>
                            </div>
                          </div>

                          {/* Panel Body (Specific Selection) */}
                          <AnimatePresence>
                            {mode === "specific" && (
                              <motion.div
                                initial={{
                                  height: 0,
                                }}
                                animate={{
                                  height: "auto",
                                }}
                                exit={{
                                  height: 0,
                                }}
                                className="overflow-hidden bg-white"
                              >
                                <div className="p-4 border-t border-gray-100">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="relative flex-1">
                                      <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                      <input
                                        type="text"
                                        placeholder={`Search ${roleDef.label.toLowerCase()}...`}
                                        value={searchQueries[roleId]}
                                        onChange={(e) =>
                                          setSearchQueries((prev) => ({
                                            ...prev,
                                            [roleId]: e.target.value,
                                          }))
                                        }
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                                      />
                                    </div>
                                    <button
                                      onClick={() =>
                                        toggleAllUsers(
                                          roleId,
                                          filteredUsers?.data?.map(
                                            (u) => u._id,
                                          ),
                                        )
                                      }
                                      className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-2 bg-gray-100 rounded-lg"
                                    >
                                      {filteredUsers?.data?.every((u) =>
                                        selectedUsers[roleId].has(u._id),
                                      ) && filteredUsers?.data?.length > 0
                                        ? "Deselect All"
                                        : "Select All"}
                                    </button>
                                    <button
                                      onClick={() =>
                                        setExpandedPanels((prev) => ({
                                          ...prev,
                                          [roleId]: !isExpanded,
                                        }))
                                      }
                                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                      {isExpanded ? (
                                        <ChevronUpIcon className="w-4 h-4" />
                                      ) : (
                                        <ChevronDownIcon className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>

                                  <AnimatePresence>
                                    {isExpanded &&
                                      (userDataLoading[roleId] ? (
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                          }}
                                          animate={{
                                            opacity: 1,
                                          }}
                                          exit={{
                                            opacity: 0,
                                          }}
                                          className="max-h-[240px] flex justify-center items-center"
                                        >
                                          <LoaderCircleIcon className="w-6 h-6 text-gray-400 animate-spin" />
                                        </motion.div>
                                      ) : (
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                          }}
                                          animate={{
                                            opacity: 1,
                                          }}
                                          exit={{
                                            opacity: 0,
                                          }}
                                          className="max-h-[240px] overflow-y-auto pr-2 space-y-1 custom-scrollbar"
                                        >
                                          {filteredUsers?.meta?.total === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">
                                              No users found.
                                            </p>
                                          ) : (
                                            filteredUsers?.data?.map((user) => {
                                              const isUserSelected =
                                                selectedUsers[roleId].has(
                                                  user._id,
                                                );
                                              return (
                                                <div
                                                  key={user._id}
                                                  onClick={() =>
                                                    toggleUser(roleId, user._id)
                                                  }
                                                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isUserSelected ? colors.lightBg : "hover:bg-gray-50"}`}
                                                >
                                                  <div
                                                    className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isUserSelected ? `${colors.bg} border-transparent` : "border-gray-300 bg-white"}`}
                                                  >
                                                    {isUserSelected && (
                                                      <CheckIcon className="w-3 h-3 text-white" />
                                                    )}
                                                  </div>
                                                  <Avatar
                                                    name={`${user.name?.firstName} ${user.name?.lastName}`}
                                                    colorClass={`${colors.lightBg} ${colors.text}`}
                                                  />
                                                  <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                      {!user.name?.firstName &&
                                                        !user.name?.lastName &&
                                                        "N/A"}
                                                      {user.name?.firstName}{" "}
                                                      {user.name?.lastName}
                                                    </p>
                                                    {roleId === "CUSTOMER" ? (
                                                      <p className="text-xs text-gray-500 truncate">
                                                        {user.contactNumber ||
                                                          user.email ||
                                                          "-"}
                                                      </p>
                                                    ) : (
                                                      <p className="text-xs text-gray-500 truncate">
                                                        {user.email ||
                                                          user.contactNumber ||
                                                          "-"}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })
                                          )}
                                          {(usersData?.[roleId]?.meta?.limit ||
                                            10) <
                                            (usersData?.[roleId]?.meta?.total ||
                                              0) && (
                                            <div className="text-center mt-2">
                                              <Button
                                                onClick={() =>
                                                  getUsers(
                                                    roleId,
                                                    (usersData?.[roleId]?.meta
                                                      ?.limit || 10) + 10,
                                                  )
                                                }
                                                size="sm"
                                                className={`text-xs cursor-pointer hover:opacity-90 ${colors.bg} hover:${colors.bg} transition-colors`}
                                              >
                                                Show More
                                              </Button>
                                            </div>
                                          )}
                                        </motion.div>
                                      ))}
                                  </AnimatePresence>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Message Composition */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Message Content
              </h2>

              <div className="space-y-4">
                {(commType === "email" || commType === "both") && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter an attractive subject line..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#DC3173] focus:ring-1 focus:ring-[#DC3173] outline-none transition-all"
                    />
                  </div>
                )}

                {(commType === "push" || commType === "both") && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Notification Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Short, catchy title for the push notification..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#DC3173] focus:ring-1 focus:ring-[#DC3173] outline-none transition-all"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-xs font-semibold text-gray-600">
                      Message Body
                    </label>
                    <span className="text-xs text-gray-400">
                      {message.length} chars
                    </span>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#DC3173] focus:ring-1 focus:ring-[#DC3173] outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Preview & Actions */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
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
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    y: 20,
                    height: 0,
                  }}
                  className="overflow-hidden"
                >
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 ml-2">
                        Preview
                      </span>
                    </div>

                    <div className="p-6">
                      {(commType === "email" || commType === "both") && (
                        <div className="mb-6">
                          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-[#DC3173]/10 flex items-center justify-center">
                              <MailIcon className="w-5 h-5 text-[#DC3173]" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Subject</p>
                              <p className="font-bold text-gray-900">
                                {subject || "No subject"}
                              </p>
                            </div>
                          </div>
                          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                            {message || "No message content..."}
                          </div>
                        </div>
                      )}

                      {commType === "both" && (
                        <div className="h-px bg-gray-200 w-full my-6" />
                      )}

                      {(commType === "push" || commType === "both") && (
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm max-w-xs mx-auto relative">
                          <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">
                              1
                            </span>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#DC3173] flex items-center justify-center flex-shrink-0">
                              <BellIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900 leading-tight">
                                {title || "Notification Title"}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {message || "Notification message preview..."}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
