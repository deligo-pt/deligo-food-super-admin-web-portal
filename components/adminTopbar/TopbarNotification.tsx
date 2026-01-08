"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  allMarkReadReq,
  getAllNotificationsReq,
  singleMarkReadReq,
} from "@/services/dashboard/notifications/notifications";
import { TMeta } from "@/types";
import { TNotification } from "@/types/notification.type";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

export default function TopbarNotification() {
  const [notificationsData, setNotificationsData] = useState<{
    data: TNotification[];
    meta?: TMeta;
  }>({ data: [] });

  const getNotifications = async ({ limit = 10 }) => {
    const result = await getAllNotificationsReq({ limit });
    if (result.success) {
      setNotificationsData({ data: result.data, meta: result.meta });
    }
  };

  const markSingleAsRead = async (notification: TNotification) => {
    await singleMarkReadReq(notification._id);
    getNotifications({ limit: notificationsData?.meta?.limit || 10 });
  };

  const markAllAsRead = async () => {
    await allMarkReadReq();
    getNotifications({ limit: notificationsData?.meta?.limit || 10 });
  };

  useEffect(() => {
    (() => getNotifications({ limit: 10 }))();
  }, []);

  return (
    <div className="relative shrink-0">
      <Popover>
        <PopoverTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.06 }}
            className="p-2 rounded-lg hover:bg-pink-50 transition"
          >
            <Bell size={18} className="text-gray-700" />
          </motion.button>
        </PopoverTrigger>
        <PopoverContent className="w-80 h-96 overflow-y-scroll">
          <div className="grid gap-1">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="leading-none font-medium">Notifications</h4>
              </div>
              <div>
                <Button
                  variant="link"
                  className="text-[#DC3173] text-xs cursor-pointer"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {notificationsData?.data?.map((notification) => (
                <div
                  onClick={() => markSingleAsRead(notification)}
                  key={notification._id}
                  className={cn(
                    "bg-slate-50 px-4 py-2 rounded-md shadow cursor-pointer",
                    notification?.isRead
                      ? "bg-slate-50 hover:bg-slate-100"
                      : "bg-[#DC3173]/30 hover:bg-[#DC3173]/20"
                  )}
                >
                  <h2 className="text-sm font-medium">{notification?.title}</h2>
                  <p className="text-[10px]">{notification?.message}</p>
                </div>
              ))}
            </div>
            {(notificationsData?.meta?.total || 0) >
              (notificationsData?.meta?.limit || 10) && (
              <div className="text-center">
                <Button
                  variant="link"
                  className="text-[#DC3173] text-sm cursor-pointer"
                  onClick={() =>
                    getNotifications({
                      limit: (notificationsData?.meta?.limit || 0) + 10,
                    })
                  }
                >
                  See More
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-pink-600 rounded-full border-2 border-white"
      />
    </div>
  );
}
