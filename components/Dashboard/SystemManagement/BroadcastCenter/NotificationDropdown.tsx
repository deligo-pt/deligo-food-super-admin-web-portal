/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from 'framer-motion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Bell,
    ShoppingCart,
    Percent,
    Settings,
    CreditCard,
    AlertTriangle,
    RefreshCw,
    Megaphone,
} from "lucide-react";
import { NOTIFICATION_TYPES, TNotificationType } from "@/types/notification.type";

interface NotificationDropdownProps {
    onValueChange: (value: TNotificationType) => void;
    defaultValue?: TNotificationType;
    itemVariants: any;
}

const NotificationDropdown = ({
    onValueChange,
    defaultValue,
    itemVariants
}: NotificationDropdownProps) => {

    const getIcon = (type: TNotificationType) => {
        switch (type) {
            case "ORDER":
                return <ShoppingCart className="w-4 h-4 text-blue-500" />;
            case "OFFER":
                return <Percent className="w-4 h-4 text-green-500" />;
            case "SYSTEM":
                return <Settings className="w-4 h-4 text-slate-500" />;
            case "PAYOUT":
                return <CreditCard className="w-4 h-4 text-pink-500" />;
            case "PAYOUT_ALERT":
                return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case "TRANSACTION":
                return <RefreshCw className="w-4 h-4 text-indigo-500" />;
            case "PROMOTIONAL":
                return <Megaphone className="w-4 h-4 text-purple-500" />;
            default:
                return <Bell className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
            <label className="block text-xs font-bold uppercase mb-2 tracking-wider">
                Notification Category
            </label>

            <Select
                onValueChange={(val) => onValueChange(val as TNotificationType)}
                defaultValue={defaultValue}
            >
                <SelectTrigger className="w-full bg-gray-50 border-slate-200 focus:ring-[#DC3173] focus:border-[#DC3173]">
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>

                <SelectContent>
                    {NOTIFICATION_TYPES.map((type: TNotificationType) => (
                        <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                                {getIcon(type)}
                                <span className="text-sm font-medium">
                                    {type.replace("_", " ")}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </motion.div>
    );
};

export default NotificationDropdown;