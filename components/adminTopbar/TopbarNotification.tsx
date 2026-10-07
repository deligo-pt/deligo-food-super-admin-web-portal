"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import {
  allMarkReadReq,
  getAllNotifications,
  singleMarkReadReq,
} from "@/services/dashboard/notifications/notifications.service";
import { TMeta } from "@/types";
import { TNotification } from "@/types/notification.type";
import { queryStringFormatter } from "@/utils/formatter";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isToday, isYesterday, formatDistanceToNow } from "date-fns";

// Action modals
import ResetOtpModal from "../Modals/ResetOtpModal";
import RequestReceiptConfirmationModal from "../Modals/RequestReceiptConfirmationModal";
import FaultCancelModal from "../Modals/FaultCancelModal";
import CompleteDeliveryModal from "../Modals/CompleteDeliveryModal";
import DeliveryIssueModal, {
  DeliveryIssueType,
} from "../Modals/DeliveryIssueModal";

import {
  resetDeliveryOtpReq,
  requestReceiptConfirmationReq,
  faultCancelReq,
  completeDeliveryReq,
} from "@/services/dashboard/order/order.service";

type ActiveAction =
  | {
    type: "issue";
    orderId: string;
    orderStatus?: string;
    issueType: DeliveryIssueType;
  }
  | { type: "resetOtp"; orderId: string }
  | { type: "requestConfirmation"; orderId: string }
  | { type: "faultCancel"; orderId: string }
  | { type: "complete"; orderId: string }
  | null;

type GroupedNotifications = {
  today: TNotification[];
  yesterday: TNotification[];
  earlier: TNotification[];
};

export default function TopbarNotification() {
  const { t } = useTranslation();
  const router = useRouter();

  const [notificationsData, setNotificationsData] = useState<{
    data: TNotification[];
    meta?: TMeta;
  }>({ data: [] });

  const [action, setAction] = useState<ActiveAction>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getNotifications = async ({ limit = 20 }) => {
    const query = queryStringFormatter({ limit });
    const result = await getAllNotifications(query);
    if (result.success) {
      setNotificationsData({ data: result.data, meta: result.meta });
    }
  };

  const markSingleAsRead = async (notification: TNotification) => {
    if (notification.isRead) return;
    const result = await singleMarkReadReq(notification._id);
    if (result.success) {
      getNotifications({ limit: notificationsData?.meta?.limit || 20 });
    }
  };

  const markAllAsRead = async () => {
    const result = await allMarkReadReq();
    if (result.success) {
      getNotifications({ limit: notificationsData?.meta?.limit || 20 });
    }
  };

  useEffect(() => {
    getNotifications({ limit: 20 });
  }, []);

  // ── Unread count 
  const unreadCount = useMemo(
    () => notificationsData.data.filter((n) => !n.isRead).length,
    [notificationsData.data]
  );

  const badgeLabel =
    unreadCount === 0 ? null : unreadCount > 9 ? "9+" : String(unreadCount);

  // ── Group by date 
  const grouped: GroupedNotifications = useMemo(() => {
    const today: TNotification[] = [];
    const yesterday: TNotification[] = [];
    const earlier: TNotification[] = [];

    notificationsData.data.forEach((n) => {
      const date = new Date(n.createdAt);
      if (isToday(date)) today.push(n);
      else if (isYesterday(date)) yesterday.push(n);
      else earlier.push(n);
    });

    return { today, yesterday, earlier };
  }, [notificationsData.data]);

  // ── Helpers 
  const getDeliveryIssue = (
    notification: TNotification
  ): {
    issueType: DeliveryIssueType;
    orderId: string;
    orderStatus?: string;
  } | null => {
    const data = notification?.data;
    if (!data?.orderId) return null;

    if (
      data.type === "DELIVERY_EXCEPTION" &&
      data.exceptionType === "DELIVERY_OTP_LOCKED"
    ) {
      return {
        issueType: "DELIVERY_OTP_LOCKED",
        orderId: data.orderId,
        orderStatus: data.orderStatus,
      };
    }

    if (data.type === "DELIVERY_VERIFICATION") {
      return {
        issueType: "DELIVERY_VERIFICATION",
        orderId: data.orderId,
        orderStatus: data.orderStatus,
      };
    }

    return null;
  };

  const getNotificationLink = (notification: TNotification): string | null => {
    const orderId = notification?.data?.orderId;
    const orderStatus = notification?.data?.orderStatus;

    if (orderId && orderStatus === "AWAITING_PARTNER") {
      return `/admin/all-orders/${orderId}/nearby-partners`;
    }
    return null;
  };

  const handleNotificationClick = (notification: TNotification) => {
    markSingleAsRead(notification);

    const issue = getDeliveryIssue(notification);
    if (issue) {
      setAction({
        type: "issue",
        orderId: issue.orderId,
        orderStatus: issue.orderStatus,
        issueType: issue.issueType,
      });
    }
  };

  const close = () => setAction(null);

  // ── Action handlers (unchanged logic) ──────────────────────────────
  const handleResetOtp = async (payload: { reason: string }) => {
    if (!action || (action.type !== "resetOtp" && action.type !== "issue"))
      return;
    const orderId = action.orderId;
    const toastId = toast.loading("Resetting OTP...");
    setIsSubmitting(true);
    try {
      const res = await resetDeliveryOtpReq(orderId, payload);
      if (res?.success) {
        toast.success(res.message || "OTP reset successfully", { id: toastId });
        close();
        router.refresh();
        return;
      }
      if (res?.data?.errorSources) {
        res.data.errorSources.forEach((err: { path: string; message: string }) =>
          toast.error(err?.message, { id: toastId })
        );
        return;
      }
      toast.error(res.message || "Otp reset failed", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestConfirmation = async () => {
    if (
      !action ||
      (action.type !== "requestConfirmation" && action.type !== "issue")
    )
      return;
    const orderId = action.orderId;
    const toastId = toast.loading("Sending request to customer...");
    setIsSubmitting(true);
    try {
      const res = await requestReceiptConfirmationReq(orderId);
      if (res?.success) {
        toast.success(res.message || "Request sent", { id: toastId });
        close();
        router.refresh();
        return;
      }
      if (res?.data?.errorSources) {
        res.data.errorSources.forEach((err: { path: string; message: string }) =>
          toast.error(err?.message, { id: toastId })
        );
        return;
      }
      toast.error(res.message || "Request sent failed", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFaultCancel = async (payload: { reason: string }) => {
    if (!action || (action.type !== "faultCancel" && action.type !== "issue"))
      return;
    const orderId = action.orderId;
    const toastId = toast.loading("Cancelling...");
    setIsSubmitting(true);
    try {
      const res = await faultCancelReq(orderId, payload);
      if (res?.success) {
        toast.success(res.message || "Order fault-cancelled", { id: toastId });
        close();
        router.refresh();
        return;
      }
      if (res?.data?.errorSources) {
        res.data.errorSources.forEach((err: { path: string; message: string }) =>
          toast.error(err?.message, { id: toastId })
        );
        return;
      }
      toast.error(res.message || "Order Fault-cancellation failed", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteDelivery = async (payload: { reason: string }) => {
    if (!action || (action.type !== "complete" && action.type !== "issue"))
      return;
    const orderId = action.orderId;
    const toastId = toast.loading("Completing delivery...");
    setIsSubmitting(true);
    try {
      const res = await completeDeliveryReq(orderId, payload);
      if (res?.success) {
        toast.success(res.message || "Delivery completed", { id: toastId });
        close();
        router.refresh();
        return;
      }
      if (res?.data?.errorSources) {
        res.data.errorSources.forEach((err: { path: string; message: string }) =>
          toast.error(err?.message, { id: toastId })
        );
        return;
      }
      toast.error(res.message || "Delivery failed", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render one notification item 
  const renderNotificationItem = (notification: TNotification) => {
    const link = getNotificationLink(notification);
    const issue = getDeliveryIssue(notification);
    const timeLabel = formatDistanceToNow(new Date(notification.createdAt), {
      addSuffix: true,
    });

    const content = (
      <div
        onClick={() => handleNotificationClick(notification)}
        className={cn(
          "relative px-3 py-2.5 rounded-lg cursor-pointer transition-colors border",
          notification.isRead
            ? "bg-slate-50 border-transparent hover:bg-slate-100"
            : "bg-[#DC3173]/15 border-[#DC3173]/20 hover:bg-[#DC3173]/12"
        )}
      >
        {/* Unread dot */}
        {!notification.isRead && (
          <span className="absolute left-1.5 top-3.5 h-1.5 w-1.5 rounded-full bg-[#DC3173]" />
        )}

        <div className={cn(!notification.isRead && "pl-2.5")}>
          <div className="flex items-start justify-between gap-2">
            <h2
              className={cn(
                "text-sm leading-snug",
                notification.isRead ? "font-medium text-slate-700" : "font-semibold text-slate-900"
              )}
            >
              {notification.title}
            </h2>
            <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
              {timeLabel}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
            {notification.message}
          </p>

          {issue && (
            <p className="text-[10px] mt-1.5 font-medium text-[#DC3173]">
              {issue.issueType === "DELIVERY_OTP_LOCKED"
                ? t("tap_to_resolve_otp") || "Tap to resolve OTP lock"
                : t("tap_to_resolve_verification") ||
                "Tap to resolve verification issue"}
            </p>
          )}
        </div>
      </div>
    );

    if (link && !issue) {
      return (
        <Link key={notification._id} href={link} className="block">
          {content}
        </Link>
      );
    }

    return <div key={notification._id}>{content}</div>;
  };

  // Section renderer 
  const renderSection = (label: string, items: TNotification[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          {label}
        </p>
        <div className="space-y-1.5">{items.map(renderNotificationItem)}</div>
      </div>
    );
  };

  return (
    <div className="relative shrink-0">
      <Popover>
        <PopoverTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.06 }}
            className="relative p-2 rounded-lg hover:bg-pink-50 transition"
          >
            <Bell size={18} className="text-gray-700" />

            {/* Unread badge */}
            <AnimatePresence>
              {badgeLabel && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-[#DC3173] text-white text-[10px] font-bold leading-none border-2 border-white"
                >
                  {badgeLabel}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-90 p-0 shadow-lg border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{t("notifications")}</h4>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium text-[#DC3173] bg-[#DC3173]/10 px-1.5 py-0.5 rounded-full">
                  {unreadCount} {t("new") || "new"}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="link"
                className="text-[#DC3173] text-xs h-auto p-0 cursor-pointer"
                onClick={markAllAsRead}
              >
                {t("mark_all_as_read")}
              </Button>
            )}
          </div>

          {/* List */}
          <div className="max-h-105 overflow-y-auto px-3 py-3 space-y-4">
            {notificationsData.data.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">
                  {t("no_notifications")}
                </p>
              </div>
            ) : (
              <>
                {renderSection(t("today") || "Today", grouped.today)}
                {renderSection(t("yesterday") || "Yesterday", grouped.yesterday)}
                {renderSection(t("earlier") || "Earlier", grouped.earlier)}
              </>
            )}
          </div>

          {/* See more */}
          {(notificationsData?.meta?.total || 0) >
            (notificationsData?.meta?.limit || 20) && (
              <div className="border-t border-slate-100 px-3 py-2 text-center">
                <Button
                  variant="link"
                  className="text-[#DC3173] text-xs cursor-pointer"
                  onClick={() =>
                    getNotifications({
                      limit: (notificationsData?.meta?.limit || 0) + 20,
                    })
                  }
                >
                  {t("see_more")}
                </Button>
              </div>
            )}
        </PopoverContent>
      </Popover>

      {/* ── Modals ── */}
      {action?.type === "issue" && (
        <DeliveryIssueModal
          open={true}
          onOpenChange={(open) => !open && close()}
          orderId={action.orderId}
          orderStatus={action.orderStatus}
          issueType={action.issueType}
          onResetOtp={() =>
            setAction({ type: "resetOtp", orderId: action.orderId })
          }
          onRequestConfirmation={() =>
            setAction({
              type: "requestConfirmation",
              orderId: action.orderId,
            })
          }
          onViewOrder={() => {
            close();
            router.push(`/admin/all-orders/${action.orderId}`);
          }}
        />
      )}

      <ResetOtpModal
        open={action?.type === "resetOtp"}
        onOpenChange={(open) => !open && close()}
        onConfirm={handleResetOtp}
        isSubmitting={isSubmitting}
      />

      <RequestReceiptConfirmationModal
        open={action?.type === "requestConfirmation"}
        onOpenChange={(open) => !open && close()}
        onConfirm={handleRequestConfirmation}
        isSubmitting={isSubmitting}
      />

      <FaultCancelModal
        open={action?.type === "faultCancel"}
        onOpenChange={(open) => !open && close()}
        onConfirm={handleFaultCancel}
        isSubmitting={isSubmitting}
      />

      <CompleteDeliveryModal
        open={action?.type === "complete"}
        onOpenChange={(open) => !open && close()}
        onConfirm={handleCompleteDelivery}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}