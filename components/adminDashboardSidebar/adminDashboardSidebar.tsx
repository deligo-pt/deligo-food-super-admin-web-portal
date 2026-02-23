"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BadgeEuro,
  Bike,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid,
  LayoutDashboard,
  Menu,
  MessageCircleMore,
  NotepadText,
  Package,
  Settings,
  ShieldUser,
  ShoppingBag,
  SquareChartGantt,
  Ticket,
  ToolCase,
  Users,
  Utensils,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import TopbarIcons from "@/components/adminTopbar/TopbarIcons";
import { useTranslation } from "@/hooks/use-translation";
import { TAdmin } from "@/types/admin.type";
import Image from "next/image";

interface IProps {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  admin: TAdmin;
}

const PRIMARY = "#DC3173";

export default function Sidebar({ open, setOpen, admin }: IProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const MENU = [
    {
      id: "dashboard",
      title: t("dashboard"),
      icon: <LayoutDashboard size={18} />,
      path: "/admin/dashboard",
    },
    {
      id: "vendors",
      title: t("vendors"),
      icon: <Utensils size={18} />,
      items: [
        { name: t("all_vendors"), path: "/admin/all-vendors" },
        { name: t("pending_approvals"), path: "/admin/pending-approvals" },
        { name: t("active_vendors"), path: "/admin/active-vendors" },
        { name: t("suspended_vendors"), path: "/admin/suspended-vendors" },
        { name: t("add_new_vendor"), path: "/admin/add-vendor" },
        { name: "Vendor Zones", path: "/admin/vendor-zones" },
        {
          name: "Vendor Performance Analytics",
          path: "/admin/vendor-performance",
        },
        { name: t("vendor_payouts"), path: "/admin/vendor-payouts" },
      ],
    },
    {
      id: "fleets",
      title: t("fleet_managers"),
      icon: <Users size={18} />,
      items: [
        { name: t("all_fleet_managers"), path: "/admin/all-fleet-managers" },
        { name: t("add_new_fleet_manager"), path: "/admin/add-fleet-manager" },
        {
          name: t("fleet_manager_wallet"),
          path: "/admin/fleet-manager-wallet",
        },
        {
          name: t("payout_requests"),
          path: "/admin/fleet-manager-withdrawals",
        },
        { name: t("zones_and_coverage_areas"), path: "/admin/fleet-zones" },
        {
          name: t("fleet_performance_analytics"),
          path: "/admin/fleet-performance",
        },
        {
          name: t("suspended_blocked_fleet_managers"),
          path: "/admin/blocked-fleet-managers",
        },
      ],
    },
    {
      id: "customers",
      title: t("customers"),
      icon: <Users size={18} />,
      items: [
        { name: t("all_customers"), path: "/admin/all-customers" },
        { name: t("active_customers"), path: "/admin/active-customers" },
        { name: t("blocked_customers"), path: "/admin/blocked-customers" },
        { name: t("customer_feedback"), path: "/admin/customer-feedback" },
      ],
    },
    {
      id: "driverss",
      title: t("delivery_partners"),
      icon: <Bike size={18} />,
      items: [
        {
          name: t("all_delivery_partners"),
          path: "/admin/all-delivery-partners",
        },
        {
          name: t("delivery_partner_onboarding_requests"),
          path: "/admin/delivery-partner-onboarding-requests",
        },
        {
          name: t("active_delivery_partners"),
          path: "/admin/active-delivery-partners",
        },
        {
          name: t("suspended_delivery_partners"),
          path: "/admin/suspended-delivery-partners",
        },
        {
          name: "Add New Delivery Partner",
          path: "/admin/add-delivery-partner",
        },
        {
          name: t("delivery_partner_performance"),
          path: "/admin/delivery-partner-performance",
        },
        {
          name: t("delivery_partner_payouts"),
          path: "/admin/delivery-partner-payouts",
        },
        {
          name: t("delivery_partner_analytics"),
          path: "/admin/delivery-partner-analytics",
        },
      ],
    },
    {
      id: "business-categories",
      title: t("business_categories"),
      icon: <Grid size={18} />,
      items: [
        {
          name: t("add_business_categories"),
          path: "/admin/business-categories/add",
        },
        {
          name: t("all_business_categories"),
          path: "/admin/business-categories",
        },
      ],
    },
    {
      id: "product-categories",
      title: t("product_categories"),
      icon: <SquareChartGantt size={18} />,
      items: [
        {
          name: t("add_product_categories"),
          path: "/admin/product-categories/add",
        },
        {
          name: t("all_product_categories"),
          path: "/admin/product-categories",
        },
      ],
    },
    {
      id: "orders",
      title: t("orders_management"),
      icon: <ShoppingBag size={18} />,
      items: [
        { name: t("all_orders"), path: "/admin/all-orders" },
        { name: t("pending_orders"), path: "/admin/pending-orders" },
        { name: t("preparing_orders"), path: "/admin/preparing-orders" },
        { name: t("on_the_way_orders"), path: "/admin/on-the-way-orders" },
        { name: t("delivered_orders"), path: "/admin/delivered-orders" },
        { name: t("cancelled_orders"), path: "/admin/cancelled-orders" },
      ],
    },
    {
      id: "payments-earnings",
      title: t("payments_and_earnings"),
      icon: <BadgeEuro size={18} />,
      items: [
        { name: t("platform_earnings"), path: "/admin/platform-earnings" },
        { name: t("vendor_payouts"), path: "/admin/vendor-payouts" },
        { name: t("driver_payouts"), path: "/admin/driver-payouts" },
        { name: t("transaction_history"), path: "/admin/transaction-history" },
        { name: t("payment_disputes"), path: "/admin/payment-disputes" },
        {
          name: "All Taxes",
          path: "/admin/all-taxes",
        },
        { name: "Create tax", path: "/admin/create-tax" },
      ],
    },
    {
      id: "inventory-control",
      title: t("inventory_and_menu_control"),
      icon: <Package size={18} />,
      items: [
        { name: t("all_items"), path: "/admin/all-products" },
        { name: t("out_of_stock_alerts"), path: "/admin/out-of-stock-alerts" },
        { name: t("restricted_items"), path: "/admin/restricted-items" },
      ],
    },
    {
      id: "promotions-and-offers",
      title: "Promotions & Offers",
      icon: <Ticket size={18} />,
      items: [
        { name: "All Offers", path: "/admin/all-offers" },
        { name: t("active_campaigns"), path: "/admin/active-campaigns" },
        { name: "Expired Offers", path: "/admin/expired-offers" },
        { name: t("create_new_offer"), path: "/admin/create-new-offer" },
        { name: t("coupon_analytics"), path: "/admin/coupon-analytics" },
        {
          name: "Sponsorships",
          path: "/admin/sponsorships",
        },
        { name: "Add Sponsorship", path: "/admin/add-sponsorship" },
      ],
    },
    {
      id: "analytics-and-insights",
      title: t("analytics_and_insights"),
      icon: <ChartNoAxesCombined size={18} />,
      items: [
        { name: t("sales_analytics"), path: "/admin/sales-analytics" },
        { name: t("delivery_insights"), path: "/admin/delivery-insights" },
        { name: t("customer_insights"), path: "/admin/customer-insights" },
        { name: t("top_vendors"), path: "/admin/top-vendors" },
        { name: t("peak_hours_analytics"), path: "/admin/peak-hours-analysis" },
      ],
    },
    {
      id: "system-management",
      title: t("system_management"),
      icon: <ToolCase size={18} />,
      items: [
        {
          name: t("email_and_notification_settings"),
          path: "/admin/email-notification-settings",
        },
        { name: t("maintenance_mode"), path: "/admin/maintenance-mode" },
        {
          name: t("in_app_notifications"),
          path: "/admin/send-notification-fleet",
        },
      ],
    },
    {
      id: "admin-management",
      title: t("admin_management"),
      icon: <ShieldUser size={18} />,
      items: [
        { name: t("all_admins"), path: "/admin/all-admins" },
        { name: t("roles_and_permissions"), path: "/admin/roles-permissions" },
        { name: t("activity_logs"), path: "/admin/activity-logs" },
        { name: t("login_history"), path: "/admin/login-history" },
      ],
    },
    {
      id: "support-communication",
      title: t("support_communication"),
      icon: <MessageCircleMore size={18} />,
      items: [
        { name: t("support_tickets"), path: "/admin/support-tickets" },
        { name: t("chat_with_vendors"), path: "/admin/chat-with-vendors" },
        {
          name: t("chat_with_fleet_managers"),
          path: "/admin/chat-with-fleet-managers",
        },
        { name: t("chat_with_drivers"), path: "/admin/chat-with-drivers" },
        { name: t("chat_with_customers"), path: "/admin/chat-with-customers" },
      ],
    },
    {
      id: "reports",
      title: t("reports"),
      icon: <NotepadText size={18} />,
      items: [
        { name: t("sales_report"), path: "/admin/sales-report" },
        { name: t("order_report"), path: "/admin/order-report" },
        {
          name: t("driver_performance_report"),
          path: "/admin/drivers-performance-report",
        },
        { name: "Customer Report", path: "/admin/customer-report" },
        { name: t("vendor_report"), path: "/admin/vendor-report" },
        { name: "Fleet Manager Report", path: "/admin/fleet-manager-report" },
        {
          name: "Delivery Partner Report",
          path: "/admin/delivery-partner-report",
        },
      ],
    },
    {
      id: "settings",
      title: t("settings"),
      icon: <Settings size={18} />,
      items: [
        { name: t("business_info"), path: "/admin/business-info" },
        { name: t("branding_and_theme"), path: "/admin/branding-theme" },
        { name: t("localization"), path: "/admin/localization" },
        {
          name: t("notification_preferences"),
          path: "/admin/notification-preferences",
        },
        { name: t("legal_documents"), path: "/admin/legal-documents" },
        { name: t("global_settings"), path: "/admin/global-settings" },
      ],
    },
    {
      id: "sos",
      title: t("sos_emergency"),
      icon: <AlertCircle size={18} />,
      items: [{ name: "All SOS", path: "/admin/sos" }],
    },
  ];

  const currentMenuId = MENU.find((menu) =>
    menu.items?.some((item) => pathname.includes(item.path)),
  )?.id;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    ...(currentMenuId ? { [currentMenuId]: true } : {}),
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#DC3173] overflow-hidden shadow-md">
            <Image
              src="/deligoLogo.png"
              alt="DeliGo Logo"
              width={36}
              height={36}
              className="object-cover"
              unoptimized
            />
          </div>
          <h1 className="font-bold text-xl text-[#DC3173]">DeliGo</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0 relative z-1001">
          <TopbarIcons admin={admin} />
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={24} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: open ? 280 : 80 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="hidden md:flex h-screen bg-linear-to-b from-pink-50 via-white to-pink-100 shadow-xl flex-col border-r border-pink-200 overflow-hidden fixed left-0 top-0 z-40"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-pink-200">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: open ? 0 : 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white font-bold shadow-lg overflow-hidden"
              style={{ background: PRIMARY }}
            >
              <Image
                src="/deligoLogo.png"
                alt="DeliGo Logo"
                width={40}
                height={40}
                className="object-cover"
                unoptimized
              />
            </motion.div>
            {open && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-xl text-[#DC3173] transition-opacity duration-300"
              >
                DeliGo Admin
              </motion.h1>
            )}
          </div>

          <button
            onClick={() => setOpen && setOpen(!open)}
            className="p-2 rounded-lg hover:bg-pink-100 transition-colors"
          >
            {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto no-scrollbar">
          {MENU.map((menu) => (
            <div key={menu.id} className="mb-1">
              {menu.path ? (
                <Link
                  href={menu.path}
                  className={`flex items-center w-full justify-between p-2 rounded-lg transition-colors ${
                    pathname === menu.path
                      ? "bg-linear-to-r from-pink-200 to-pink-100 text-pink-700 font-semibold"
                      : "hover:bg-pink-100"
                  } ${!open ? "justify-center" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-pink-600">{menu.icon}</div>
                    {open && (
                      <span className="font-medium text-gray-700">
                        {menu.title}
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleExpand(menu.id)}
                    className={`flex items-center w-full justify-between p-2 rounded-lg hover:bg-pink-100 transition-colors  ${!open ? "justify-center" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-pink-600">{menu.icon}</div>
                      {open && (
                        <span className="font-medium text-gray-700 text-left">
                          {menu.title}
                        </span>
                      )}
                    </div>
                    {menu.items && open && (
                      <motion.div
                        animate={{ rotate: expanded[menu.id] ? 180 : 0 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    )}
                  </button>

                  <AnimatePresence>
                    {expanded[menu.id] && open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-9 mt-1 flex flex-col gap-1"
                      >
                        {menu.items?.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.path}
                            className={`text-sm px-2 py-1 rounded-md transition-all duration-300 ${
                              pathname === sub.path
                                ? "bg-linear-to-r from-pink-200 to-pink-100 text-pink-700 font-semibold"
                                : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          ))}
        </nav>

        {open && (
          <div className="border-t border-pink-200 py-3 px-3 text-center text-xs text-gray-500">
            © 2025 <span style={{ color: PRIMARY }}>Admin</span> Dashboard
          </div>
        )}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden flex"
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white w-72 h-full p-4 shadow-xl overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: PRIMARY }}>
                  DeliGo Menu
                </h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-gray-600"
                >
                  <X size={22} />
                </button>
              </div>

              {MENU.map((menu) => (
                <div key={menu.id} className="mb-2">
                  {menu.path ? (
                    <Link
                      href={menu.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 py-2 ${
                        pathname === menu.path
                          ? "text-pink-700 font-semibold"
                          : "text-gray-800 hover:text-pink-600"
                      }`}
                    >
                      <div className="text-pink-600">{menu.icon}</div>
                      <span>{menu.title}</span>
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleExpand(menu.id)}
                        className="flex items-center justify-between w-full py-2 text-gray-800 font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-pink-600">{menu.icon}</div>
                          <span>{menu.title}</span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            expanded[menu.id] ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {expanded[menu.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pl-8 mt-1 flex flex-col gap-1"
                          >
                            {menu.items?.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.path}
                                onClick={() => setMobileOpen(false)}
                                className={`text-sm py-1 transition-all ${
                                  pathname === sub.path
                                    ? "text-pink-700 font-semibold"
                                    : "text-gray-600 hover:text-pink-600"
                                }`}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
