
import { AnimatePresence } from "framer-motion";
import { BellIcon, MailIcon } from "lucide-react";
import { motion } from 'framer-motion';

interface IProps {
    commType: "PUSH" | "BOTH" | "EMAIL";
    title: string;
    message: string;
    showPreview: boolean;
}

export default function PreviewCard({ commType, title, message, showPreview }: IProps) {

    return (
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
                            {(commType === "EMAIL" || commType === "BOTH") && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-[#DC3173]/10 flex items-center justify-center">
                                            <MailIcon className="w-5 h-5 text-[#DC3173]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Title</p>
                                            <p className="font-bold text-gray-900">
                                                {title || "No Title"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(commType === "PUSH" || commType === "BOTH") && (
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm max-w-xs mx-auto relative">
                                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-white">
                                            1
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#DC3173] flex items-center justify-center shrink-0">
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
    );
}