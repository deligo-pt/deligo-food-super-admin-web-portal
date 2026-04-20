"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { BellIcon, EyeIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const defaultValues = {
  title: "We'll be back soon",
  message:
    "We are performing scheduled maintenance. The system will return shortly.",
};

export default function MaintenanceMode() {
  const [title, setTitle] = useState(defaultValues.title);
  const [message, setMessage] = useState(defaultValues.message);
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
    if (!title.trim()) return toast.error("Please enter a title.");
    if (!message.trim()) return toast.error("Please enter a message.");

    setTimeout(() => {
      setTitle(defaultValues.title);
      setMessage(defaultValues.message);
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
          title="Maintenance Mode"
          subtitle="Send announcements, alerts, or promotional messages to specific user groups across the platform."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Message Composition */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Message Content
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Maintenance Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Maintenance Title for all users"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#DC3173] focus:ring-1 focus:ring-[#DC3173] outline-none transition-all"
                  />
                </div>

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

                    <div className="bg-gray-50 p-6 rounded-2xl p-4 border border-gray-100 shadow-sm max-w-xs mx-auto relative my-4">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                  Send
                </button>
              </div>
            </motion.div>
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
